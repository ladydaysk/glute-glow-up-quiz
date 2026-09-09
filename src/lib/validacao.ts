/**
 * Validacao anti-lead-falso — mesmas regras dos formularios da Shark.
 *
 * Nao e seguranca, e qualidade de base: corta quem so estava "brincando"
 * com o formulario antes do lead entrar no CRM e virar tarefa de alguem.
 */

function normalizarTexto(str: string) {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * Radicais longos e especificos. Comparados por "a palavra CONTEM o radical",
 * o que pega variacao e erro de digitacao ("validacao", "testerson") sem risco
 * de barrar nome real — nenhum nome comum em portugues tem "valid" ou "exempl".
 */
const RADICAIS_FALSOS = [
  "teste", "testand", "testar", "testad", "testing", "tester",
  "valid", "verific", "checand", "checagem", "conferind", "conferir",
  "exempl", "amostr", "sample", "demonstr", "rascunh", "provand",
  "simul", "dummy", "placehold", "generic", "padrao",
  "lorem", "ipsum", "falso", "falsa", "mentira", "brincadeir", "brincand",
  "temporari", "xpto", "foobar",
  "fulano", "ciclano", "beltrano", "seunome",
];

/**
 * Palavras curtas e comuns. So barram se a palavra for EXATAMENTE igual — em
 * modo "contem" pegariam nome real por acidente ("oi" dentro de "Moises").
 */
const PALAVRAS_FALSAS = new Set([
  "demo", "temp", "foo", "bar", "abc", "abcd", "abcde", "abcdef",
  "asdf", "asdfg", "asdfgh", "qwerty", "qwe",
  "nao", "naosei", "sei", "sla", "oi", "ola", "kkk", "kkkk",
  "nada", "vazio", "embranco", "qualquer", "aaa", "bbb", "ccc",
  "nome", "sobrenome", "xxxx", "yyyy", "zzzz",
]);

function digitosRepetidos(s: string) {
  return /^(\d)\1+$/.test(s);
}

function digitosSequenciais(s: string) {
  let cresce = true;
  let decresce = true;
  for (let i = 1; i < s.length; i++) {
    if (+s[i] !== +s[i - 1] + 1) cresce = false;
    if (+s[i] !== +s[i - 1] - 1) decresce = false;
  }
  return cresce || decresce;
}

export function nomeInvalido(bruto: string) {
  const norm = normalizarTexto(bruto.trim());
  if (!norm) return true;
  const compacto = norm.replace(/\s+/g, "");
  if (compacto.length < 4) return true;
  if (!/[a-z]/.test(compacto)) return true;
  if (/^(.)\1+$/.test(compacto)) return true; // "aaaaaa"

  const palavras = norm.split(/\s+/).filter(Boolean);
  if (palavras.length < 2) return true; // exige nome + sobrenome

  // tira numero do fim de cada palavra ("teste1", "validacao22") antes de comparar
  const limpas = palavras.map((p) => p.replace(/[0-9]+$/, ""));
  if (limpas.some((p) => PALAVRAS_FALSAS.has(p))) return true;
  if (limpas.some((p) => RADICAIS_FALSOS.some((r) => p.includes(r)))) return true;
  return false;
}

const DDDS_VALIDOS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  21, 22, 24, 27, 28,
  31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48, 49,
  51, 53, 54, 55,
  61, 62, 63, 64, 65, 66, 67, 68, 69,
  71, 73, 74, 75, 77, 79,
  81, 82, 83, 84, 85, 86, 87, 88, 89,
  91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

/** Recebe so digitos. Assume numero brasileiro. */
export function telefoneInvalido(digitos: string) {
  if (digitos.length !== 10 && digitos.length !== 11) return true;
  if (digitosRepetidos(digitos)) return true;

  const ddd = Number(digitos.slice(0, 2));
  if (!DDDS_VALIDOS.has(ddd)) return true;

  const local = digitos.slice(2);
  if (digitosRepetidos(local)) return true;
  if (digitos.length === 11 && local[0] !== "9") return true; // celular BR comeca com 9

  // Sequencia so na parte que a pessoa escolhe: o DDD e o 9 fixo quebram o
  // padrao e fariam "61 91234-5678" passar despercebido.
  const nucleo = digitos.length === 11 ? local.slice(1) : local;
  if (nucleo.length >= 5 && (digitosRepetidos(nucleo) || digitosSequenciais(nucleo))) return true;

  return false;
}

/** Aceita com ou sem @; devolve normalizado com @. */
export function normalizarInstagram(bruto: string) {
  const limpo = bruto.trim().replace(/^@+/, "").replace(/\s+/g, "");
  return limpo ? `@${limpo}` : "";
}

export function instagramInvalido(bruto: string) {
  const limpo = bruto.trim().replace(/^@+/, "").replace(/\s+/g, "");
  if (limpo.length < 2) return true;
  // Instagram permite letras, numeros, ponto e underline.
  return !/^[A-Za-z0-9._]+$/.test(limpo);
}
