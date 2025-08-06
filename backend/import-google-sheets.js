const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const { getUsers, updateUser, createUser } = require('./database/firebase');

// Configuração do Google Sheets
const SPREADSHEET_ID = '1FJR2OnyJDhSiETwUgyJKG6R1teoRvBdy6LWt7Wq5YZA'; // Substitua pelo ID da sua planilha
const GOOGLE_SERVICE_ACCOUNT_EMAIL = 'sheet-import@peaceful-oath-188414.iam.gserviceaccount.com'; // Email da conta de serviço
const GOOGLE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDGTtJ5Rac/AP9K\nnLrP291u1zAjFwUhM+h+XQS8KXvjEisFMbJF2aA+Hm6G1Loo3hVP3D6Q9JzqvN9y\n/FkYGBhfywWJcb4pUSSoEiSe+8O6yQdrfDK2RQW7x36jAEkv0L4p9CjNOmDPwJs1\nrgzpKTLXTrlwSSRsJh5kSAa29YfbD+9lTgOHtjGHsIYZ3aFdq5W8f1BHd3FSLpyL\nIBpvvHV8Ma/RmjLH/Kfn0fGKWpZ0TlpWZRY6Ugv3Ng0oxVAYnkl7YnuHQsvGOHCh\nVXO0HdHVIzxc++cpHdSXPWRyRvYM+7k5kTX6VGqF2/N1WfZpgqU4BPVAtrX9hMVo\njIn6067FAgMBAAECggEAKV/hrva23cDOAtmvalXDnfActX2EjvhfDhpHNiDrnaU5\nP5SuTr+InN1Jjy0MCCHJzYc0sJawtJMihcGbrxi74SShK5uFIuawoLZkWJ1LqYlu\n2GCpzfiZqSOGyuhw3J6PRn6QEr2W3FGhsHH3dKApYN2meARyqnPLjH2wlPSmWzBa\nP8hHBwtqzMMzJkMIVOZdvP1BmbHiyPSKJWqZiyvRhAamJ+wzxUMGCQqGG+4wjfqK\nywtIwdDTYFryccqrdx6xi123i8Pkp3/CuVtqjnOx7WozUWABS+KKtMJxHmfc1qy4\nkszvEDtyv87/JwFRHkX8nuT+ZWI0bjMEV8tVsysFQwKBgQDvV03E0gOCvE5YG8Xx\nXvaVQiGfgs7YInOjE51U6VOmrXmq3bD1XdgcWs7tBwWpcGVYa6YHyso9WGpgacU1\neukdg+TIfX3+X1S2yFrXz+l7D6yQTq3mpDDTxvU4Ojf/jzWGVq72/4iicdyKCs0D\nYi4WwCYH2Pdh7XsDsSJdcX7ChwKBgQDUHF6vHNmLPymaNVuETFqxKdnDBf2PjojE\nw6ZmpPxO79Ec/a1tgO6EJ3+EtxMgXhWlVVct3l2AGGtVVhs37ghvsZh5VhKkWu11\nGM9mPrjnn8ODe68XyKgrNGgAxGuT5hNGJrIraWXnfUmeWCDc6A/gJY5NslNxv6xl\nnYvnAs67UwKBgH5A1IJNspJlWQJ7bBheWr7zip8FNq2mxs8wip7/EiRrgDHVDgLx\nBQ44DM3WFXODGcLhzkxv+e0QVdUUFnaWpp/uMmJcaHklup9M4zbSszw6UXIyPuPa\nmvMsEbEebOm/lqGN2m/q7h2a6JZdCjaNtPhFVgpvtlePGYQiDZmzRAXDAoGAeh9/\ncGk245JRPKU99NUVXm2PIFdBnzbcjhVrqCuTzUsMZhm0kZirO1GWfO3/SCKDafbR\nw+oEgW0N10tFTpVxLAXfmPSytQhZMZNATkkMoud8ZSaAMDxqfr2kp9Rvb+8G59v9\ntzru3jJngZCSEz5VbaOR5DApFRPbiYIE+9PE/VsCgYEAyPzBPdedizFhXx1Xbxri\nWrMh9gqe3aRjrtZPZxLruaA0uoOwO8a+D5Uy2d4iYlb3ehwkiu6L05AawM49vlDW\nnXjjlNNxWJvqWVYTb8vKameJ94A1DaoDw80aq9RbeBm2mClQPAhZ8BofPzl/1Vjw\n07R6FMpH/9xJ3bILXfdMiuc=\n-----END PRIVATE KEY-----\n'; // Chave privada da conta de serviço

async function importFromGoogleSheets() {
  try {
    console.log('📊 Iniciando importação do Google Sheets...');
    
    // Configurar autenticação com escopos corretos
    const serviceAccountAuth = new JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
        'https://spreadsheets.google.com/feeds'
      ],
    });

    console.log('🔐 Autenticando com Google Sheets...');
    
    // Conectar à planilha
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    
    console.log('📋 Carregando informações da planilha...');
    await doc.loadInfo();
    
    console.log(`📋 Planilha encontrada: ${doc.title}`);
    console.log(`📝 Total de planilhas: ${doc.sheetCount}`);
    
    // Acessar a primeira planilha
    const sheet = doc.sheetsByIndex[0];
    console.log(`📝 Planilha selecionada: ${sheet.title}`);
    
    console.log('📊 Carregando células da planilha...');
    await sheet.loadCells();
    
    console.log(`📝 Planilha: ${sheet.title} (${sheet.rowCount} linhas, ${sheet.columnCount} colunas)`);
    
    // Ler dados da planilha
    const users = [];
    
    // Assumindo que a primeira linha tem os cabeçalhos
    console.log('🔍 Lendo dados da planilha...');
    for (let rowIndex = 1; rowIndex < sheet.rowCount; rowIndex++) {
      const nome = sheet.getCell(rowIndex, 0).value;
      const login = sheet.getCell(rowIndex, 1).value;
      const turma = sheet.getCell(rowIndex, 2).value;
      const senha = sheet.getCell(rowIndex, 3).value;
      
      console.log(`📋 Linha ${rowIndex + 1}: ${nome} | ${login} | ${turma} | ${senha}`);
      
      // Verificar se a linha tem dados válidos
      if (nome && login && turma && senha) {
        users.push({
          nome: nome.toString(),
          login: login.toString(),
          turma: turma.toString(),
          senha: senha.toString()
        });
      }
    }
    
    console.log(`👥 Encontrados ${users.length} usuários na planilha`);
    
    if (users.length === 0) {
      console.log('⚠️ Nenhum usuário encontrado na planilha. Verifique:');
      console.log('  1. Se a planilha tem dados');
      console.log('  2. Se a primeira linha não é cabeçalho');
      console.log('  3. Se as colunas estão na ordem correta (Nome, Login, Turma, Senha)');
      return;
    }
    
    // Buscar usuários existentes no Firebase
    console.log('🔥 Conectando ao Firebase...');
    const existingUsers = await getUsers();
    const existingUsersArray = Object.values(existingUsers || {});
    
    console.log(`🔥 Encontrados ${existingUsersArray.length} usuários no Firebase`);
    
    // Processar cada usuário da planilha
    let created = 0;
    let updated = 0;
    let skipped = 0;
    
    for (const sheetUser of users) {
      // Verificar se o usuário já existe
      const existingUser = existingUsersArray.find(u => u.login === sheetUser.login);
      
      if (existingUser) {
        // Atualizar usuário existente
        console.log(`🔄 Atualizando usuário: ${sheetUser.login}`);
        
        await updateUser(existingUser.id, {
          nome: sheetUser.nome,
          turma: sheetUser.turma,
          senha: sheetUser.senha
        });
        
        updated++;
      } else {
        // Criar novo usuário
        console.log(`➕ Criando novo usuário: ${sheetUser.login}`);
        
        // Gerar 4 IDs únicos de 1 a 5 (sem repetição)
        const questionIds = [];
        while (questionIds.length < 4) {
          const randomId = Math.floor(Math.random() * 5) + 1;
          if (!questionIds.includes(randomId)) {
            questionIds.push(randomId);
          }
        }
        
        const newUser = {
          id: existingUsersArray.length + created + 1, // Adicionar ID explícito
          login: sheetUser.login,
          nome: sheetUser.nome,
          turma: sheetUser.turma,
          senha: sheetUser.senha,
          escola: 'FGV MALHADOS INTELECTUAIS', // Valor padrão
          serie: 'EQUIPE BASE', // Valor padrão
          xp_atual: 0, // Garantir que seja 0
          erros: 0,
          id_q1: questionIds[0], // ID único da pergunta 1
          response_q1: false, // Boolean padrão false
          id_q2: questionIds[1], // ID único da pergunta 2
          response_q2: false, // Boolean padrão false
          id_q3: questionIds[2], // ID único da pergunta 3
          response_q3: false, // Boolean padrão false
          id_q4: questionIds[3], // ID único da pergunta 4
          response_q4: false // Boolean padrão false
        };
        
        // Criar usuário com ID numérico sequencial
        const nextId = existingUsersArray.length + created + 1;
        const userId = await createUser(newUser, nextId);
        
        // Atualizar o usuário com o ID correto
        await updateUser(userId, { id: userId });
        
        created++;
      }
    }
    
    console.log('\n🎉 Importação concluída!');
    console.log(`📊 Resumo:`);
    console.log(`  - Criados: ${created} usuários`);
    console.log(`  - Atualizados: ${updated} usuários`);
    console.log(`  - Ignorados: ${skipped} linhas`);
    console.log(`  - Total processados: ${users.length} usuários`);
    
  } catch (error) {
    console.error('❌ Erro na importação:', error);
    
    if (error.response) {
      console.error('📊 Detalhes do erro:');
      console.error(`  - Status: ${error.response.status}`);
      console.error(`  - Mensagem: ${error.response.statusText}`);
      
      if (error.response.status === 403) {
        console.error('\n🔧 Soluções para erro 403:');
        console.error('1. Verifique se a planilha foi compartilhada com o email da conta de serviço');
        console.error('2. Verifique se a conta de serviço tem permissão de "Editor" na planilha');
        console.error('3. Verifique se a Google Sheets API está ativada no Google Cloud Console');
        console.error('4. Verifique se as credenciais estão corretas');
      }
    }
  }
}

// Função para configurar as credenciais
function setupCredentials() {
  console.log('🔧 Configuração necessária:');
  console.log('1. Crie uma conta de serviço no Google Cloud Console');
  console.log('2. Compartilhe sua planilha com o email da conta de serviço');
  console.log('3. Configure as variáveis no início do script:');
  console.log('   - SPREADSHEET_ID: ID da sua planilha');
  console.log('   - GOOGLE_SERVICE_ACCOUNT_EMAIL: Email da conta de serviço');
  console.log('   - GOOGLE_PRIVATE_KEY: Chave privada da conta de serviço');
  console.log('');
  console.log('📋 Estrutura esperada da planilha:');
  console.log('  Coluna A: Nome');
  console.log('  Coluna B: Login');
  console.log('  Coluna C: Turma');
  console.log('  Coluna D: Senha');
}

// Executar se chamado diretamente
if (require.main === module) {
  if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID') {
    setupCredentials();
  } else {
    importFromGoogleSheets();
  }
}

module.exports = { importFromGoogleSheets, setupCredentials }; 