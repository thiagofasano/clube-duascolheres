// Dados de contato da Duas Colheres Pudim, usados no site todo.

export const NOME_LOJA = "Duas Colheres Pudim";
export const SLOGAN = "Feito para adoçar momentos.";

export const WHATSAPP = "5521970136262";
export const TELEFONE_FORMATADO = "(21) 97013-6262";
export const INSTAGRAM = "duascolherespudim";

export function linkWhatsapp(mensagem = "Olá! Vim pelo site e gostaria de fazer um pedido 🍮"): string {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
}

export const LINK_INSTAGRAM = `https://www.instagram.com/${INSTAGRAM}/`;
