import { z } from "zod";

// ============================================================
// Validators Core
// ============================================================

export const clienteSchema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  cpfCnpj: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),
  tipo: z.enum(["FISICA", "JURIDICA"]).default("FISICA"),
});

export const fornecedorSchema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  cnpj: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),
});

export const produtoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  descricao: z.string().optional(),
  preco: z.number({ required_error: "Preço é obrigatório" }).min(0, "Preço não pode ser negativo"),
  custo: z.number().min(0).optional(),
  unidade: z.string().default("UN"),
  categoria: z.string().optional(),
  codigoBarras: z.string().optional(),
});

export const contaPagarSchema = z.object({
  fornecedorId: z.string().optional(),
  descricao: z.string().min(3, "Descrição deve ter ao menos 3 caracteres"),
  valor: z.number().positive("Valor deve ser positivo"),
  vencimento: z.date({ required_error: "Data de vencimento é obrigatória" }),
  categoria: z.string().optional(),
  observacao: z.string().optional(),
});

export const contaReceberSchema = z.object({
  clienteId: z.string().optional(),
  descricao: z.string().min(3),
  valor: z.number().positive(),
  vencimento: z.date(),
  categoria: z.string().optional(),
  observacao: z.string().optional(),
});

// ============================================================
// Validators Nicho: Restaurante
// ============================================================

export const mesaSchema = z.object({
  numero: z.number().int().positive("Número da mesa deve ser positivo"),
  capacidade: z.number().int().min(1).default(4),
  area: z.string().optional(),
});

export const itemPedidoSchema = z.object({
  produtoId: z.string(),
  quantidade: z.number().positive("Quantidade deve ser positiva"),
  observacao: z.string().optional(),
});

export const comandaSchema = z.object({
  mesaId: z.string().optional(),
  clienteId: z.string().optional(),
  observacao: z.string().optional(),
});

// ============================================================
// Tipos inferidos dos schemas
// ============================================================

export type ClienteInput = z.infer<typeof clienteSchema>;
export type FornecedorInput = z.infer<typeof fornecedorSchema>;
export type ProdutoInput = z.infer<typeof produtoSchema>;
export type ContaPagarInput = z.infer<typeof contaPagarSchema>;
export type ContaReceberInput = z.infer<typeof contaReceberSchema>;
export type MesaInput = z.infer<typeof mesaSchema>;
export type ItemPedidoInput = z.infer<typeof itemPedidoSchema>;
export type ComandaInput = z.infer<typeof comandaSchema>;
