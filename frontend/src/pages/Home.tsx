import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { useUser } from '../contexts/UserContext';
import { apiService } from '../services/api';

function Home() {
  const { user, setUser } = useUser();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginData, setLoginData] = useState({ login: '', senha: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Dados reais do ranking serão carregados do backend
  const [topTurmas, setTopTurmas] = useState<any[]>([]);
  const [turmaUsuario, setTurmaUsuario] = useState<any>(null);

  // Carregar dados do ranking
  useEffect(() => {
    const loadRankingData = async () => {
      try {
        // Só carregar dados reais se o usuário estiver logado
        if (!user || !user.login) {
         // setTopTurmas([]);
         // setTurmaUsuario(null);
          return;
        }
        
        console.log('🔄 Carregando ranking real...');
        
        const top3Response = await apiService.getTop3Classes();
        console.log('📊 Top 3 turmas:', top3Response);
        setTopTurmas(top3Response.top3 || []);
        
        // Se o usuário estiver logado, buscar posição da turma dele
        if (user && user.turma && user.escola) {
          const turmaResponse = await apiService.getClassPosition(user.turma, user.escola);
          console.log('👥 Posição da turma:', turmaResponse);
          setTurmaUsuario({
            turma: user.turma,
            escola: user.escola,
            posicao: turmaResponse.turma.posicao,
            mediaXp: turmaResponse.turma.mediaXp || 0
          });
        }
      } catch (error) {
        console.error('❌ Erro ao carregar ranking:', error);
        // Em caso de erro, limpar dados
       // setTopTurmas([]);
       // setTurmaUsuario(null);
      }
    };

    loadRankingData();
  }, [user]);

  // Abrir modal automaticamente se não há usuário logado
  useEffect(() => {
    if (!user || !user.login) {
      setShowLoginModal(true);
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
                      const response = await apiService.login(loginData.login, loginData.senha);
                setUser(response.user as any);
      setShowLoginModal(false);
      setLoginData({ login: '', senha: '' });
    } catch (error: any) {
      setLoginError(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const renderTopItem = (item: any, position: number) => {
    const emojis = ['🥇', '🥈', '🥉'];
    const cores = ['#ef7d00', '#e6007e', '#95c11f'];
    
    return (
      <div key={item.id} style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px',
        marginBottom: '8px',
        borderRadius: '8px',
        background: position < 3 ? `rgba(${position === 0 ? '239,125,0' : position === 1 ? '230,0,126' : '149,193,31'},0.1)` : '#f8f9fa',
        border: position < 3 ? `2px solid ${cores[position]}` : '1px solid #dee2e6'
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: position < 3 ? cores[position] : '#6c757d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: 18,
          marginRight: 12
        }}>
          {position < 3 ? emojis[position] : position + 1}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{item.turma}</div>
          <div style={{ fontSize: 12, color: '#6c757d' }}>{item.escola}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Badge bg="warning" text="dark" style={{ fontSize: 12, marginBottom: 4 }}>
            Score: {item.scoreGlobal || item.mediaXp}
          </Badge>
          <div style={{ fontSize: 10, color: '#6c757d' }}>
            XP: {item.mediaXp} | Part: {Math.round((item.mediaParticipacao || 0) * 100)}%
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <Row className="justify-content-center">
        <Col xs={12} md={8}>
          <Card className="gamified-card mb-4">
            <Card.Body>
              <Card.Title style={{ fontWeight: 700, fontSize: 28, color: '#ef7d00', marginBottom: 20 }} className="text-center-mobile">
                🎓 EDURATS
              </Card.Title>
              <Card.Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 30 }}>
                Sistema de gamificação educacional que transforma o aprendizado em uma jornada emocionante!
              </Card.Text>
              
              <div style={{ 
                background: 'rgba(149, 193, 31, 0.1)', 
                padding: '20px', 
                borderRadius: '12px',
                border: '2px solid rgba(149, 193, 31, 0.3)',
                marginBottom: 30
              }}>
                <h5 style={{ color: '#95c11f', fontWeight: 600, marginBottom: 15 }}>
                  🏆 TOP 3 Turmas - Score Global (XP × Participação)
                </h5>
                
                {topTurmas.length > 0 ? (
                  <>
                    {topTurmas.map((item, index) => renderTopItem(item, index))}
                    
                    {turmaUsuario && turmaUsuario.posicao > 3 && (
                      <div style={{ marginTop: 15, paddingTop: 15, borderTop: '1px solid #dee2e6' }}>
                        <h6 style={{ color: '#6c757d', marginBottom: 10 }}>Sua Turma:</h6>
                        {renderTopItem(turmaUsuario, turmaUsuario.posicao - 1)}
                      </div>
                    )}
                  </>
                ) : user && user.login ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '20px', 
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    📊 Carregando ranking...
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '20px', 
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    🔐 Faça login para ver o ranking das turmas
                  </div>
                )}
              </div>

              <div style={{ 
                background: 'rgba(239, 125, 0, 0.1)', 
                padding: '20px', 
                borderRadius: '12px',
                border: '2px solid rgba(239, 125, 0, 0.3)',
                marginBottom: 30
              }}>
                <h5 style={{ color: '#ef7d00', fontWeight: 600, marginBottom: 15 }}>
                  🎯 Benefícios da Gamificação
                </h5>
                <ul style={{ fontSize: 16, marginBottom: 0 }}>
                  <li>Aprendizado através de desafios diários</li>
                  <li>Sistema de XP e níveis para motivação</li>
                  <li>Ranking competitivo entre turmas</li>
                  <li>Feedback imediato e dicas personalizadas</li>
                  <li>Progresso visual e conquistas</li>
                </ul>
              </div>

              <div className="text-center">
                <Button 
                  variant="success" 
                  size="lg" 
                  className="gamified-btn"
                  onClick={() => {
                    if (user && user.login) {
                      window.location.href = '/quiz';
                    } else {
                      setShowLoginModal(true);
                    }
                  }}
                  style={{ fontSize: 18, padding: '12px 30px' }}
                >
                  🚀 Começar a Jogar
                </Button>
              </div>
            </Card.Body>
          </Card>


        </Col>
      </Row>

      {/* Modal de Login */}
      <Modal 
        show={showLoginModal} 
        onHide={() => {
          // Só permite fechar se o usuário estiver logado
          if (user && user.login) {
            setShowLoginModal(false);
          }
        }} 
        centered
        dialogClassName="modal-dialog-centered"
      >
        <Modal.Header 
          closeButton={user && user.login ? true : false} 
          style={{ background: '#ef7d00', color: '#fff' }}
        >
          <Modal.Title>🔐 Login - EDURATS</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!user || !user.login ? (
            <div style={{ 
              background: 'rgba(230, 0, 126, 0.1)', 
              padding: '15px', 
              borderRadius: '8px',
              border: '2px solid rgba(230, 0, 126, 0.3)',
              marginBottom: 20
            }}>
              <div style={{ fontWeight: 600, color: '#e6007e', marginBottom: 5 }}>
                🔐 Credenciais de Acesso
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>
                <strong>Login:</strong> Seu Email Pessoal<br/>
                <strong>Senha:</strong> Sua data de Nascimento (DDMMAAAA)
              </div>
            </div>
          ) : null}
          
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Login:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite seu login"
                value={loginData.login}
                onChange={(e) => setLoginData({ ...loginData, login: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Senha:</Form.Label>
              <Form.Control
                type="password"
                placeholder="Digite sua senha"
                value={loginData.senha}
                onChange={(e) => setLoginData({ ...loginData, senha: e.target.value })}
                required
              />
            </Form.Group>
            
            {loginError && (
              <Alert variant="danger" className="mb-3">
                {loginError}
              </Alert>
            )}
            
            <div className="d-grid gap-2">
              <Button 
                type="submit" 
                variant="success" 
                disabled={isLoggingIn}
                className="gamified-btn"
              >
                {isLoggingIn ? 'Entrando...' : 'Entrar'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Home; 