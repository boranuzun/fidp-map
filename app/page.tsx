import { db } from '@/lib/db';
import DashboardClient from '@/components/DashboardClient';
import { type Property } from '@/components/PropertyMap';

export default async function Page() {
  const rs = await db.execute('SELECT * FROM property');
  // Sanitize rows to plain objects for React Server Components serialization
  const properties = rs.rows.map(row => ({ ...row })) as unknown as Property[];

  return <DashboardClient initialProperties={properties} />;
}
