// utils/promptUtils.js
const formatPromptData = (data) => {
  let dataPrompt = `## Informações do Aluno\n`;
  dataPrompt += data.nome ? `Nome: ${data.nome}\n` : '';
  dataPrompt += data.idade ? `Idade: ${data.idade} anos\n` : '';
  dataPrompt += data.peso ? `Peso: ${data.peso} kg\n` : '';
  dataPrompt += data.altura ? `Altura: ${data.altura} cm\n` : '';
  dataPrompt += data.genero ? `Gênero: ${data.genero}\n` : '';
  dataPrompt += data.restricoes ? `Restrições ou Lesões: ${data.restricoes}\n` : '';
  
  dataPrompt += `\n## Informações do Treino\n`;
  dataPrompt += data.objetivo ? `Objetivo Principal: ${data.objetivo}\n` : '';
  dataPrompt += data.nivel ? `Nível de Treino: ${data.nivel}\n` : '';
  dataPrompt += data.dias_semana ? `Frequência: ${data.dias_semana}x por semana\n` : '';
  dataPrompt += data.tempo_treino ? `Duração: ${data.tempo_treino} minutos por treino\n` : '';
  dataPrompt += data.preferencias ? `Preferências de Exercícios: ${data.preferencias}\n` : '';
  
  dataPrompt += `\n## Gerar treino personalizado com o seguinte formato:
  
  1. Nome do treino (deve ser um nome curto e descritivo)
  2. Descrição do treino (breve explicação do objetivo e foco do treino)
  3. Lista de exercícios, cada um com:
     - Nome do exercício
     - Descrição curta
     - Número de séries
     - Número de repetições
     - Peso sugerido (ou indicar "Peso corporal" se aplicável)
  
  Formate a saída como JSON com a seguinte estrutura:
  {
    "name": "Nome do Treino",
    "description": "Descrição do treino",
    "type": "Tipo do treino (ex: Força, Hipertrofia)",
    "exercises": [
      {
        "name": "Nome do Exercício",
        "description": "Descrição curta",
        "sets": "3",
        "reps": "12",
        "weight": "20"
      }
    ]
  }
  `;
  
  return dataPrompt;
};

module.exports = { formatPromptData };