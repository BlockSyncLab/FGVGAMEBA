
import { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Row, Col, Badge, ProgressBar } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import MinhaTurma from './pages/MinhaTurma';
import { UserProvider, useUser } from './contexts/UserContext';
import { apiService } from './services/api';
import './App.css';

// Função para determinar o estágio do estudante
function getStage(nivel: number) {
  if (nivel === 1) return { nome: 'Coelho', cor: '#e6007e' };
  if (nivel <= 3) return { nome: 'Lebre', cor: '#ef7d00' };
  return { nome: 'Rato', cor: '#6c757d' };
}

function AppContent() {
  const { user, setUser, refreshUserData } = useUser();
  const stage = getStage(user.nivel);
  const xpTotal = user.xp_atual || user.xp;
  const xpAtual = xpTotal % 50;
  const xpParaProxNivel = 50 - xpAtual;

  // Estados para timer e dia do desafio
  const [currentDay, setCurrentDay] = useState(1);
  const [maxDays, setMaxDays] = useState(4);
  const [timeUntilNext, setTimeUntilNext] = useState<{hours: number, minutes: number, seconds: number}>({hours: 0, minutes: 0, seconds: 0});
  const [nextQuestionInfo, setNextQuestionInfo] = useState<any>(null);
  const [userPosition, setUserPosition] = useState<{posicao: number, totalUsuarios: number} | null>(null);
  const [turmaPosition, setTurmaPosition] = useState<{posicao: number, totalTurmas: number} | null>(null);

  // Função para carregar informações do timer e dia atual
  const loadNextQuestionInfo = async () => {
    try {
      const response = await apiService.getNextQuestionInfo();
      if (response.success) {
        // Atualizar timer se houver próxima pergunta
        if (response.hasNextQuestion && response.timeUntilNext) {
          setTimeUntilNext({
            hours: response.timeUntilNext.hours,
            minutes: response.timeUntilNext.minutes,
            seconds: response.timeUntilNext.totalSeconds % 60
          });
        }
        setNextQuestionInfo(response);
      }
    } catch (error) {
      console.error('Erro ao carregar informações do timer:', error);
    }
  };

  // Função para carregar o dia atual
  const loadCurrentDay = async () => {
    try {
      const response = await apiService.getAvailableQuestions();
      if (response.currentDay) {
        setCurrentDay(response.currentDay);
      }
      if (response.maxDays) {
        setMaxDays(response.maxDays);
      }
    } catch (error) {
      console.error('Erro ao carregar dia atual:', error);
    }
  };

  // Função para carregar posição do usuário
  const loadUserPosition = async () => {
    try {
      console.log('🔄 Carregando posição do usuário...');
      const response = await apiService.getUserPosition();
      console.log('📊 Resposta da API de ranking:', response);
      
      if (response.success) {
        setUserPosition({
          posicao: response.user.posicao,
          totalUsuarios: response.user.totalUsuarios
        });
        console.log(`✅ Posição atualizada: #${response.user.posicao} de ${response.user.totalUsuarios}`);
      } else {
        console.log('❌ API retornou success: false');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar posição do usuário:', error);
    }
  };

  // Função para carregar posição da turma
  const loadTurmaPosition = async () => {
    try {
      if (!user || !user.turma || !user.escola) return;
      
      console.log('🔄 Carregando posição da turma...');
      const response = await apiService.getClassPosition(user.turma, user.escola);
      console.log('📊 Resposta da API de ranking da turma:', response);
      
      if (response.success) {
        setTurmaPosition({
          posicao: response.turma.posicao,
          totalTurmas: 0 // Será calculado posteriormente se necessário
        });
        console.log(`✅ Posição da turma atualizada: #${response.turma.posicao}`);
      } else {
        console.log('❌ API retornou success: false');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar posição da turma:', error);
    }
  };

  // Carregar informações quando o usuário estiver logado
  useEffect(() => {
    if (user && user.login) {
      console.log('🔄 Usuário logado, carregando dados...');
      console.log('👤 Dados do usuário:', user);
      
      loadNextQuestionInfo();
      loadCurrentDay();
      loadUserPosition();
      loadTurmaPosition();
      
      const interval = setInterval(() => {
        loadNextQuestionInfo();
        loadUserPosition(); // Atualizar posição periodicamente
        loadTurmaPosition(); // Atualizar posição da turma periodicamente
      }, 60000); // Atualizar a cada minuto
      
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <Router>
      {/* Painel de progresso fixo no topo - só mostra se usuário logado */}
      {user && user.login && (
        <div style={{ position: 'sticky', top: 0, zIndex: 1050, width: '100%' }}>
          <Container fluid className="py-2 menu-superior-compacto" style={{ 
            background: 'linear-gradient(135deg, #fff8f0, #fff0f8)', 
            borderBottom: '3px solid #ef7d00', 
            boxShadow: '0 4px 15px rgba(239, 125, 0, 0.2)',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* Layout horizontal: Badge/Level + Timer/Dia */}
            <Row className="align-items-center justify-content-center mb-2" style={{ width: '100%' }}>
              {/* Badge e Level - Esquerda */}
              <Col xs={6} md={6} className="mb-2">
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8,
                  padding: '6px 12px',
                  background: 'rgba(230,0,126,0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(230,0,126,0.3)',
                  justifyContent: 'center'
                }}>
                  {/* Avatar */}
                  <div style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    background: stage.cor, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#fff', 
                    fontWeight: 700, 
                    fontSize: 16, 
                    border: '2px solid #95c11f',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}>
                    {stage.nome[0]}
                  </div>
                  <div>
                    <Badge className="gamified-badge" style={{ fontSize: 10 }}>{stage.nome}</Badge>
                    <div style={{ fontSize: 10, color: '#666', textAlign: 'center' }}>Nível {user.nivel}</div>
                  </div>
                </div>
              </Col>
              
              {/* Timer e Dia - Direita */}
              <Col xs={6} md={6} className="mb-2">
                <div className="timer-container" style={{ 
                  padding: '6px 12px',
                  background: 'rgba(149,193,31,0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(149,193,31,0.3)',
                  justifyContent: 'center'
                }}>
                  <div className="timer-content">
                                <div style={{ fontWeight: 700, fontSize: 14, color: '#95c11f' }}>
              DIA {String(currentDay).padStart(2, '0')} de {String(maxDays).padStart(2, '0')}
            </div>
            {/* Botão temporário para forçar atualização */}
            <button 
              onClick={refreshUserData}
              style={{ 
                fontSize: '10px', 
                padding: '2px 4px', 
                marginLeft: '5px',
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
              title="Forçar atualização dos dados"
            >
              🔄
            </button>
                    {nextQuestionInfo && nextQuestionInfo.hasNextQuestion && (
                      <div style={{ fontSize: 12, color: '#666' }}>
                        ⏰ {String(timeUntilNext.hours).padStart(2, '0')}:{String(timeUntilNext.minutes).padStart(2, '0')}
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
            
            {/* XP Progress - Linha separada */}
            <Row className="justify-content-center mb-2" style={{ width: '100%' }}>
              <Col xs="auto" className="text-center-mobile">
                <div style={{ 
                  padding: '6px 12px',
                  background: 'rgba(239,125,0,0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(239,125,0,0.3)',
                  minWidth: '200px'
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#ef7d00' }}>
                    XP: {user.xp_atual || user.xp}
                  </div>
                  <ProgressBar now={xpAtual} max={50} style={{ height: 8, marginTop: 2 }} />
                  <div style={{ fontSize: 9, color: '#666', marginTop: 2 }}>
                    +{xpParaProxNivel} para próximo
                  </div>
                </div>
              </Col>
            </Row>
            
            {/* Layout horizontal: Aluno + Turma lado a lado */}
            <Row className="justify-content-center" style={{ fontSize: 13, width: '100%' }}>
              <Col xs={6} md={6} className="mb-2">
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  padding: '8px 12px', 
                  background: 'rgba(230,0,126,0.1)', 
                  borderRadius: 8, 
                  border: '2px solid rgba(230,0,126,0.3)',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#e6007e', fontWeight: 700, fontSize: 16 }}>👤</span>
                  <div>
                    <div style={{ fontWeight: 600, color: '#e6007e' }}>{user.nome}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>XP: {user.xp_atual || user.xp} pontos</div>
                  </div>
                </div>
              </Col>
              <Col xs={6} md={6} className="mb-2">
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  padding: '8px 12px', 
                  background: 'rgba(239,125,0,0.1)', 
                  borderRadius: 8, 
                  border: '2px solid rgba(239,125,0,0.3)',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#ef7d00', fontWeight: 700, fontSize: 16 }}>👥</span>
                  <div>
                    <div style={{ fontWeight: 600, color: '#ef7d00' }}>Turma {user.turma}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>
                      {user.escola} • {user.serie} • 
                      {turmaPosition ? ` #${turmaPosition.posicao} no ranking de turmas` : ' Carregando...'}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      )}
      <Navbar expand="lg" className="gamified-navbar" variant="dark">
        <Container style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <Navbar.Brand as={Link} to="/">EDURATS</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto justify-content-center-mobile">
              <Nav.Link as={Link} to="/">Início</Nav.Link>
              <Nav.Link as={Link} to="/quiz">Quiz</Nav.Link>
              {user && user.login && (
                <Nav.Link as={Link} to="/minha-turma">Minha Turma</Nav.Link>
              )}
            </Nav>
            {user && user.login && (
              <Nav>
                <Nav.Link 
                  onClick={() => {
                    setUser({
                      login: '',
                      nome: '',
                      nivel: 1,
                      xp: 0,
                      escola: '',
                      serie: '',
                      turma: '',
                      // Remover dados de ranking - serão calculados pela API
                    });
                    localStorage.removeItem('user');
                    window.location.href = '/';
                  }}
                  style={{ cursor: 'pointer', color: '#dc3545' }}
                >
                  🚪 Sair
                </Nav.Link>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="mt-4 mb-5" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/minha-turma" element={<MinhaTurma />} />
        </Routes>
      </Container>
    </Router>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
