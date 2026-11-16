import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { FEEDBACK_SHEET_TEMPLATE } from "../src/lib/card-template-seeds";

const db = new PrismaClient();
type SeedTemplate = {
  name: string;
  category: string;
  primary: string;
  secondary: string;
  text: string;
  html?: string;
  css?: string;
  description?: string;
};

const templates: SeedTemplate[] = [
  { name: "White Minimal", category: "MINIMAL", primary: "#FFFFFF", secondary: "#EEF4FF", text: "#14243E" },
  { name: "Soft Grey", category: "MINIMAL", primary: "#F1F5F9", secondary: "#FFFFFF", text: "#24344D" },
  { name: "Clean Blue", category: "MINIMAL", primary: "#2563EB", secondary: "#EFF6FF", text: "#FFFFFF" },
  { name: "Corporate White", category: "MINIMAL", primary: "#FFFFFF", secondary: "#2563EB", text: "#17253B" },
  { name: "Black and Gold", category: "PREMIUM", primary: "#111827", secondary: "#D9AB4A", text: "#FFFFFF" },
  { name: "Black and Purple", category: "PREMIUM", primary: "#171326", secondary: "#925BF5", text: "#FFFFFF" },
  { name: "Restaurant", category: "BUSINESS", primary: "#FFF4E7", secondary: "#C34C2F", text: "#34231F" },
  { name: "Cafe", category: "BUSINESS", primary: "#F5EEE5", secondary: "#77573F", text: "#30271F" },
  { name: "Gradient Blue", category: "MODERN", primary: "#315EDB", secondary: "#7DB4FF", text: "#FFFFFF" },
  { name: "Geometric", category: "MODERN", primary: "#EAF0FA", secondary: "#293C5B", text: "#15243B" },
  {
    name: FEEDBACK_SHEET_TEMPLATE.name,
    category: FEEDBACK_SHEET_TEMPLATE.category,
    primary: FEEDBACK_SHEET_TEMPLATE.primary,
    secondary: FEEDBACK_SHEET_TEMPLATE.secondary,
    text: FEEDBACK_SHEET_TEMPLATE.text,
    html: FEEDBACK_SHEET_TEMPLATE.html,
    css: FEEDBACK_SHEET_TEMPLATE.css,
    description: FEEDBACK_SHEET_TEMPLATE.description,
  },
];

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) before seeding.");
  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.upsert({
    where: { email },
    update: { name: "Vistar Admin", passwordHash, role: "ADMIN", active: true },
    create: { email, name: "Vistar Admin", passwordHash, role: "ADMIN" },
  });

  for (const item of templates) {
    const old = await db.designTemplate.findFirst({ where: { name: item.name } });
    const preview = { primary: item.primary, secondary: item.secondary, text: item.text, brand: "Vistar" };
    const source = { preview, html: item.html ?? null, react: null, css: item.css ?? null };
    if (old) {
      await db.designTemplate.update({ where: { id: old.id }, data: { category: item.category, description: item.description ?? `${item.category.toLowerCase()} card design`, preview, html: item.html ?? null, react: null, css: item.css ?? null, published: true } });
      const version = await db.designTemplateVersion.findFirst({ where: { templateId: old.id, version: 1 } });
      if (version) await db.designTemplateVersion.update({ where: { id: version.id }, data: { source } });
      else await db.designTemplateVersion.create({ data: { templateId: old.id, version: 1, source } });
    } else {
      const row = await db.designTemplate.create({ data: { name: item.name, category: item.category, description: item.description ?? `${item.category.toLowerCase()} card design`, preview, html: item.html ?? null, react: null, css: item.css ?? null, published: true } });
      await db.designTemplateVersion.create({ data: { templateId: row.id, version: 1, source } });
    }
  }
  console.log(`Admin account and ${templates.length} card designs are ready.`);
}

main().finally(() => db.$disconnect());

