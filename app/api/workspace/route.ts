import { env } from 'cloudflare:workers';
import { createWorkspaceTable } from '../../../db/schema';

type RuntimeEnv={DB:D1Database};
function owner(request:Request){
  const id=request.headers.get('oai-authenticated-user-id');
  const host=new URL(request.url).hostname;
  if(id)return id;
  if(host==='localhost'||host==='127.0.0.1')return 'local-owner';
  return null;
}
async function ready(db:D1Database){await db.prepare(createWorkspaceTable).run()}

export async function GET(request:Request){
  const id=owner(request);if(!id)return Response.json({error:'unauthorized'},{status:401});
  const db=(env as unknown as RuntimeEnv).DB;await ready(db);
  const row=await db.prepare('SELECT payload, updated_at FROM workspaces WHERE owner_id = ?').bind(id).first<{payload:string;updated_at:string}>();
  return Response.json(row?{data:JSON.parse(row.payload),updatedAt:row.updated_at}:{data:null});
}
export async function PUT(request:Request){
  const id=owner(request);if(!id)return Response.json({error:'unauthorized'},{status:401});
  const body=await request.json() as {data:unknown};const payload=JSON.stringify(body.data);
  if(payload.length>500_000)return Response.json({error:'payload_too_large'},{status:413});
  const db=(env as unknown as RuntimeEnv).DB;await ready(db);const now=new Date().toISOString();
  await db.prepare('INSERT INTO workspaces (owner_id,payload,updated_at) VALUES (?,?,?) ON CONFLICT(owner_id) DO UPDATE SET payload=excluded.payload, updated_at=excluded.updated_at').bind(id,payload,now).run();
  return Response.json({ok:true,updatedAt:now});
}
