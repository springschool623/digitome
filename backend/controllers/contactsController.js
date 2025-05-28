import { pool } from '../db.js'

export const getAllContacts = async (req, res) => {
  const result = await pool.query(`
    SELECT c.*, 
           r.name as rank_name,
           p.name as position_name,
           d.name as department_name,
           l.name as location_name
    FROM contacts c
    LEFT JOIN ranks r ON c.rank_id = r.id
    LEFT JOIN positions p ON c.position_id = p.id
    LEFT JOIN departments d ON c.department_id = d.id
    LEFT JOIN locations l ON c.location_id = l.id
    ORDER BY c.id ASC
  `)
  res.json(result.rows)
}

export const getContact = async (req, res) => {
  const { id } = req.params
  const result = await pool.query(
    `
    SELECT c.*, 
           r.name as rank_name,
           p.name as position_name,
           d.name as department_name,
           l.name as location_name
    FROM contacts c
    LEFT JOIN ranks r ON c.rank_id = r.id
    LEFT JOIN positions p ON c.position_id = p.id
    LEFT JOIN departments d ON c.department_id = d.id
    LEFT JOIN locations l ON c.location_id = l.id
    WHERE c.id = $1
  `,
    [id]
  )

  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'Contact not found' })
  }

  res.json(result.rows[0])
}

export const createContact = async (req, res) => {
  const {
    rank_id,
    position_id,
    manager,
    department_id,
    location_id,
    address,
    military_postal_code,
    mobile_no,
  } = req.body

  try {
    const result = await pool.query(
      `INSERT INTO contacts (
        rank_id, position_id, manager, department_id, location_id, 
        address, military_postal_code, mobile_no
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [
        rank_id,
        position_id,
        manager,
        department_id,
        location_id,
        address,
        military_postal_code,
        mobile_no,
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    if (error.code === '23503') {
      // foreign key violation
      res.status(400).json({
        message:
          'Invalid reference data (rank, position, department or location)',
      })
    } else {
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export const updateContact = async (req, res) => {
  const { id } = req.params
  const {
    rank_id,
    position_id,
    manager,
    department_id,
    location_id,
    address,
    military_postal_code,
    mobile_no,
  } = req.body

  try {
    const result = await pool.query(
      `UPDATE contacts 
       SET rank_id = $1, 
           position_id = $2, 
           manager = $3, 
           department_id = $4, 
           location_id = $5, 
           address = $6,
           military_postal_code = $7, 
           mobile_no = $8
       WHERE id = $9 
       RETURNING *`,
      [
        rank_id,
        position_id,
        manager,
        department_id,
        location_id,
        address,
        military_postal_code,
        mobile_no,
        id,
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Contact not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    if (error.code === '23503') {
      // foreign key violation
      res.status(400).json({
        message:
          'Invalid reference data (rank, position, department or location)',
      })
    } else {
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export const deleteContact = async (req, res) => {
  const { id } = req.params
  const { reason } = req.body
  const actorId = req.user?.id // Assuming you have user info in request from auth middleware

  try {
    console.log('Actor Id:', actorId)

    // Start a transaction
    await pool.query('BEGIN')

    // 1. Get the contact data before deletion
    const contactResult = await pool.query(
      `
      SELECT c.*, 
             r.name as rank_name,
             p.name as position_name,
             d.name as department_name,
             l.name as location_name
      FROM contacts c
      LEFT JOIN ranks r ON c.rank_id = r.id
      LEFT JOIN positions p ON c.position_id = p.id
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN locations l ON c.location_id = l.id
      WHERE c.id = $1
    `,
      [id]
    )

    if (contactResult.rows.length === 0) {
      await pool.query('ROLLBACK')
      return res.status(404).json({ message: 'Contact not found' })
    }

    const contactData = contactResult.rows[0]

    // 2. Insert into ArchivedContacts
    await pool.query(
      `INSERT INTO ArchivedContacts 
       (original_contact_id, data, deleted_by, reason) 
       VALUES ($1, $2, $3, $4)`,
      [id, contactData, actorId, reason]
    )

    // 3. Delete from Contacts
    await pool.query('DELETE FROM contacts WHERE id = $1', [id])

    // 4. Log the deletion
    await pool.query(
      `INSERT INTO Logs 
       (actor_id, action, target_table, target_id, data) 
       VALUES ($1, $2, $3, $4, $5)`,
      [actorId, 'DELETE_CONTACT', 'contacts', id, contactData]
    )

    // Commit the transaction
    await pool.query('COMMIT')

    res.json({ message: 'Xóa liên hệ thành công' })
  } catch (error) {
    // Rollback in case of error
    await pool.query('ROLLBACK')
    console.error('Error deleting contact:', error)
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message })
  }
}

export const importContacts = async (req, res) => {
  const { contacts } = req.body;

  if (!Array.isArray(contacts) || contacts.length === 0) {
    return res.status(400).json({ 
      success: false,
      message: 'Không có liên hệ để import!' 
    });
  }

  try {
    await pool.query('BEGIN');

    const importedContacts = [];
    const failedContacts = [];

    // 🔍 Bước 1: Kiểm tra trùng trong danh sách import
    const mobileNoCount = contacts.reduce((acc, contact) => {
      acc[contact.mobile_no] = (acc[contact.mobile_no] || 0) + 1;
      return acc;
    }, {});

    for (const contact of contacts) {
      // Nếu bị trùng trong danh sách thì bỏ qua
      if (mobileNoCount[contact.mobile_no] > 1) {
        failedContacts.push({
          contact,
          error: `Số điện thoại "${contact.mobile_no}" bị trùng trong danh sách import.`,
        });
        continue;
      }

      try {
        // 🔍 Bước 2: Kiểm tra trùng trong CSDL
        const exists = await pool.query(
          'SELECT id FROM contacts WHERE mobile_no = $1',
          [contact.mobile_no]
        );
        if (exists.rows.length > 0) {
          failedContacts.push({
            contact,
            error: `Số điện thoại "${contact.mobile_no}" đã tồn tại trong hệ thống.`,
          });
          continue;
        }

        // ✅ Bước 3: Get/Create rank, position, department, location như cũ...
        // Get or create rank
        let rankId = null;
        if (contact.rank_name) {
          // Try insert, if already exists, select id
          const rankInsert = await pool.query(
            'INSERT INTO ranks (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id',
            [contact.rank_name]
          );
          // console.log(contact.rank_name);
          if (rankInsert.rows.length > 0) {
            rankId = rankInsert.rows[0].id;
          } else {
            const rankResult = await pool.query(
              'SELECT id FROM ranks WHERE name = $1',
              [contact.rank_name]
            );
            if (rankResult.rows.length > 0) rankId = rankResult.rows[0].id;
          }
        }

        // Get or create position
        let positionId = null;
        if (contact.position_name) {
          const positionInsert = await pool.query(
            'INSERT INTO positions (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id',
            [contact.position_name]
          );
          if (positionInsert.rows.length > 0) {
            positionId = positionInsert.rows[0].id;
          } else {
            const positionResult = await pool.query(
              'SELECT id FROM positions WHERE name = $1',
              [contact.position_name]
            );
            if (positionResult.rows.length > 0) positionId = positionResult.rows[0].id;
          }
        }

        // Get or create department
        let departmentId = null;
        if (contact.department_name) {
          const departmentInsert = await pool.query(
            'INSERT INTO departments (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id',
            [contact.department_name]
          );
          if (departmentInsert.rows.length > 0) {
            departmentId = departmentInsert.rows[0].id;
          } else {
            const departmentResult = await pool.query(
              'SELECT id FROM departments WHERE name = $1',
              [contact.department_name]
            );
            if (departmentResult.rows.length > 0) departmentId = departmentResult.rows[0].id;
          }
        }

        // Get or create location
        let locationId = null;
        if (contact.location_name) {
          const locationInsert = await pool.query(
            'INSERT INTO locations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id',
            [contact.location_name]
          );
          if (locationInsert.rows.length > 0) {
            locationId = locationInsert.rows[0].id;
          } else {
            const locationResult = await pool.query(
              'SELECT id FROM locations WHERE name = $1',
              [contact.location_name]
            );
            if (locationResult.rows.length > 0) locationId = locationResult.rows[0].id;
          }
        }

        // Ví dụ phần insert:
        const result = await pool.query(
          `INSERT INTO contacts (
            rank_id, position_id, manager, department_id, 
            location_id, address, military_postal_code, mobile_no
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
          RETURNING *`,
          [
            rankId,
            positionId,
            contact.manager,
            departmentId,
            locationId,
            contact.address,
            contact.military_postal_code,
            contact.mobile_no,
          ]
        );

        importedContacts.push(result.rows[0]);
      } catch (error) {
        failedContacts.push({
          contact,
          error: error.message,
        });
      }
    }

    if (failedContacts.length > 0) {
      await pool.query('ROLLBACK');
      return res.status(207).json({
        success: false,
        message: 'Một số liên hệ không thể import',
        imported: importedContacts,
        failed: failedContacts,
      });
    }

    await pool.query('COMMIT');
    return res.status(201).json({
      success: true,
      message: `Successfully imported ${importedContacts.length} contacts`,
      data: importedContacts,
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error importing contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
