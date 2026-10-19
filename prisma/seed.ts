import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed do SuperGestão Saúde no PostgreSQL...");

  // Usuários do sistema
  const admin = await prisma.usuario.upsert({
    where: { email: "carlos.menezes@saude.gov.br" },
    update: {},
    create: {
      nome: "Dr. Carlos Eduardo Menezes",
      email: "carlos.menezes@saude.gov.br",
      cpf: "123.456.789-00",
      cargo: "Superintendente de Gestão",
      setor: "Superintendência Executiva",
      perfil: "ADMINISTRADOR",
      ativo: true,
    },
  });

  // Fornecedores
  const posto = await prisma.fornecedor.upsert({
    where: { cnpj: "33.000.167/0001-01" },
    update: {},
    create: {
      cnpj: "33.000.167/0001-01",
      razaoSocial: "Vibra Energia S/A - Posto Central Saúde Ltda",
      nomeFantasia: "Posto Central de Combustíveis",
      contato: "Valter Silveira",
      email: "licitacoes@postocentral.com.br",
      telefone: "(31) 3220-4001",
      endereco: "Av. do Contorno, 4500",
      cidade: "Belo Horizonte",
      uf: "MG",
      ativo: true,
    },
  });

  const hospitalar = await prisma.fornecedor.upsert({
    where: { cnpj: "12.345.678/0001-90" },
    update: {},
    create: {
      cnpj: "12.345.678/0001-90",
      razaoSocial: "Hospitalar Distribuidora de Medicamentos e Insumos S/A",
      nomeFantasia: "Hospitalar Farma Minas",
      contato: "Renata Vasconcelos",
      email: "publico@hospitalarfarma.com.br",
      telefone: "(31) 3340-9000",
      endereco: "Rodovia Anel Rodoviário, Km 12",
      cidade: "Belo Horizonte",
      uf: "MG",
      ativo: true,
    },
  });

  console.log("Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
