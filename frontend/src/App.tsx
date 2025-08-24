
import { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Row, Col, Badge, ProgressBar } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Ranking from './pages/Ranking';

import { UserProvider, useUser } from './contexts/UserContext';
import { apiService } from './services/api';

import './App.css';

// Função para determinar o estágio do estudante
function getStage(nivel: number) {
  if (nivel === 1) return { nome: 'Aprendiz', cor: '#e6007e' };
  if (nivel <= 3) return { nome: 'Veterano', cor: '#ef7d00' };
  return { nome: 'Especialista', cor: '#95c11f' };
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
          <Container fluid className="py-1 menu-superior-compacto" style={{ 
            background: 'linear-gradient(135deg, #fff8f0, #fff0f8)', 
            borderBottom: '2px solid #ef7d00', 
            boxShadow: '0 2px 8px rgba(239, 125, 0, 0.2)',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* Layout horizontal: Badge/Level + Aluno/Turma integrados */}
            <Row className="align-items-center justify-content-center mb-1" style={{ width: '100%' }}>
              {/* Box único com todas as informações */}
              <Col xs={12} md={12} className="mb-1">
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6,
                  padding: '6px 12px',
                  background: 'rgba(230,0,126,0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(230,0,126,0.3)',
                  justifyContent: 'center'
                }}>
                  {/* Avatar */}
                  <div style={{ 
                    width: 28, 
                    height: 28, 
                    borderRadius: '50%', 
                    background: stage.cor, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#fff', 
                    fontWeight: 700, 
                    fontSize: 14, 
                    border: '2px solid #95c11f',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}>
                    {stage.nome[0]}
                  </div>
                  
                  {/* Badge + XP */}
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <Badge className="gamified-badge" style={{ fontSize: 9 }}>{stage.nome}</Badge>
                    <div style={{ fontSize: 9, color: '#666', marginTop: 2 }}>Nível {user.nivel}</div>
                    {/* XP integrado */}
                    <div style={{ fontSize: 9, fontWeight: 600, color: '#ef7d00', marginTop: 2 }}>
                      XP: {user.xp_atual || user.xp}
                    </div>
                    <ProgressBar now={xpAtual} max={50} style={{ height: 5, marginTop: 2 }} />
                    <div style={{ fontSize: 7, color: '#666', marginTop: 1 }}>
                      +{xpParaProxNivel} para próximo
                    </div>
                  </div>
                  
                  {/* Aluno */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    padding: '4px 8px',
                    background: 'rgba(108,117,125,0.1)',
                    borderRadius: '6px',
                    border: '1px solid rgba(108,117,125,0.3)'
                  }}>
                    <div style={{ fontSize: 9, color: '#666' }}>👤</div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: '#495057', textAlign: 'center' }}>
                      {user.nome}
                    </div>
                    {userPosition && (
                      <div style={{ fontSize: 8, color: '#666', textAlign: 'center' }}>
                        #{userPosition.posicao}
                      </div>
                    )}
                  </div>
                  
                  {/* Turma */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    padding: '4px 8px',
                    background: 'rgba(149,193,31,0.1)',
                    borderRadius: '6px',
                    border: '1px solid rgba(149,193,31,0.3)'
                  }}>
                    <div style={{ fontSize: 9, color: '#666' }}>🏫</div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: '#495057', textAlign: 'center' }}>
                      {user.turma}
                    </div>
                    {turmaPosition && (
                      <div style={{ fontSize: 8, color: '#666', textAlign: 'center' }}>
                        #{turmaPosition.posicao} no ranking
                      </div>
                    )}
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
          
          {/* Dia atual integrado ao navbar */}
          {user && user.login && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 10px',
              background: 'rgba(149,193,31,0.3)',
              borderRadius: '8px',
              border: '2px solid #95c11f',
              marginRight: '15px',
              boxShadow: '0 2px 4px rgba(149,193,31,0.3)',
              minWidth: 'fit-content'
            }}>
              <div style={{ fontWeight: 700, fontSize: 11, color: '#2d5016', textAlign: 'center' }}>
                DIA {String(currentDay).padStart(2, '0')}/{String(maxDays).padStart(2, '0')}
              </div>
              {nextQuestionInfo && nextQuestionInfo.hasNextQuestion && (
                <div style={{ 
                  marginLeft: '6px', 
                  paddingLeft: '6px', 
                  borderLeft: '1px solid #95c11f',
                  fontSize: 9, 
                  color: '#2d5016',
                  fontWeight: 600,
                  textAlign: 'center'
                }}>
                  ⏰ {String(timeUntilNext.hours).padStart(2, '0')}:{String(timeUntilNext.minutes).padStart(2, '0')}
                </div>
              )}
            </div>
          )}
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto justify-content-center-mobile">
              <Nav.Link as={Link} to="/">Início</Nav.Link>

              <Nav.Link as={Link} to="/quiz">Quiz</Nav.Link>
              {user && user.login && (
                <Nav.Link as={Link} to="/ranking">Ranking</Nav.Link>
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
          <Route path="/ranking" element={<Ranking />} />
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
