import fs from "fs";

let c = fs.readFileSync('apps/web/src/app/dashboard/estrategias/actions.ts', 'utf8');

const code = `export async function duplicateStrategy(id: string) {
  const { tenant } = await getAuthContext()
  if (!tenant) throw new Error("Não autenticado.")
  const db = await getDb()

  const { data: strat } = await (db as any).from("strategies").select("*").eq("id", id).single()
  if (!strat) return { error: "Estratégia não encontrada." }

  delete strat.id
  strat.name = strat.name + " (Cópia)"

  const { data: newStrat, error } = await (db as any).from("strategies").insert(strat).select().single()
  if (error) return { error: error.message }
  revalidateStrategies()
  return { success: "Estratégia duplicada.", strategyId: newStrat?.id }
}`;

c = c.replace(/export async function duplicateStrategy[\s\S]+?return { success: [\s\S]+?}/, code);

// fix any corrupted encoding characters
c = c.replace(/NÃ£o/g, "Não");
c = c.replace(/EstratÃ©gia/g, "Estratégia");
c = c.replace(/CÃ³pia/g, "Cópia");

fs.writeFileSync('apps/web/src/app/dashboard/estrategias/actions.ts', c, 'utf8');
