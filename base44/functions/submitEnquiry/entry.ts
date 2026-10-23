import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { waitUntil } from 'base44:runtime';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const type = body.type || 'general';
    const record = {
      type,
      name: String(body.name || ''),
      phone: String(body.phone || ''),
      email: String(body.email || ''),
      role: String(body.role || ''),
      organisation: String(body.organisation || ''),
      contact_person: String(body.contact_person || ''),
      students: body.students ? Number(body.students) : 0,
      collaboration_type: String(body.collaboration_type || ''),
      message: String(body.message || ''),
      cv_uri: String(body.cv_uri || ''),
      cv_link: String(body.cv_link || ''),
      status: 'new',
    };
    const created = await base44.asServiceRole.entities.Enquiry.create(record);

    let notifyEmail = 'Kwetu2025uk@gmail.com';
    try {
      const s = await base44.asServiceRole.entities.SiteSettings.list('-created_date', 1);
      if (s && s[0] && s[0].email) notifyEmail = s[0].email;
    } catch (e) { /* ignore */ }

    const subject = `New ${type.replace(/_/g, ' ')} enquiry from ${record.name || 'a visitor'}`;
    const text = [
      'A new enquiry was submitted on the Kwetu Apparels site.',
      '',
      'Type: ' + type,
      'Name: ' + record.name,
      'Phone: ' + record.phone,
      'Email: ' + record.email,
      'Role: ' + record.role,
      'Organisation: ' + record.organisation,
      'Contact person: ' + record.contact_person,
      'Number of students: ' + record.students,
      'Collaboration type: ' + record.collaboration_type,
      'CV link: ' + record.cv_link,
      '',
      'Message:',
      record.message,
    ].join('\n');

    waitUntil(
      base44.asServiceRole.integrations.Core
        .SendEmail({ to: notifyEmail, subject, text })
        .catch(() => {})
    );

    return Response.json({ ok: true, id: created.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}