import db from './db.js';

const getAllProjects = async () => {
    const query = `
        SELECT
            p.project_id,
            p.organization_id,
            p.title,
            p.description,
            p.location,
            p.project_date,
            TO_CHAR(p.project_date, 'FMMonth FMDD, YYYY') AS formatted_date,
            o.name AS organization_name
        FROM public.project p
        JOIN public.organization o
            ON p.organization_id = o.organization_id
        ORDER BY p.project_date, p.title;
    `;

    const result = await db.query(query);

    return result.rows;
};

export { getAllProjects };
