import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Modal, Form, Alert, Badge, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { apiService } from '../services/api';

function Home() {
  const { user, setUser, isCheckingAuth } = useUser();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginData, setLoginData] = useState({ login: '', senha: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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

  // Mostrar indicador de carregamento enquanto verifica autenticação
  if (isCheckingAuth) {
    return (
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        <Card className="gamified-card">
          <Card.Body>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: 24, marginBottom: 20 }}>🔄</div>
              <p>Verificando autenticação...</p>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <Card className="gamified-card mb-4">
        <Card.Body>
          <Card.Title style={{ fontWeight: 700, fontSize: 32, color: '#ef7d00', textAlign: 'center', marginBottom: 30 }}>
            🎓 Como Funciona o EDURATS
          </Card.Title>
          
          <Card.Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 40, color: '#666' }}>
            Descubra como transformar seu aprendizado em uma jornada emocionante de gamificação!
          </Card.Text>
        </Card.Body>
      </Card>

      {/* Etapa 1: Login */}
      <Card className="gamified-card mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <div style={{ 
                background: 'rgba(230, 0, 126, 0.1)', 
                padding: '20px', 
                borderRadius: '12px',
                border: '2px solid rgba(230, 0, 126, 0.3)',
                marginBottom: 20
              }}>
                <h4 style={{ color: '#e6007e', fontWeight: 700, marginBottom: 15 }}>
                  🔐 Etapa 1: Autenticação
                </h4>
                <div style={{ fontSize: 16, marginBottom: 15 }}>
                  <strong>Como acessar:</strong>
                </div>
                <ul style={{ fontSize: 14, color: '#666' }}>
                  <li><strong>Login:</strong> Seu email pessoal</li>
                  <li><strong>Senha:</strong> Sua data de nascimento (DDMMAAAA)</li>
                </ul>
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '15px', 
                  borderRadius: '8px',
                  marginTop: 15,
                  border: '1px solid #dee2e6'
                }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>
                    <strong>Exemplo:</strong>
                  </div>
                  <div style={{ fontSize: 14, fontFamily: 'monospace' }}>
                    Login: aluno@email.com<br/>
                    Senha: 15032010
                  </div>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '12px',
                border: '2px solid #dee2e6',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 48, marginBottom: 15 }}>🔐</div>
                <h5 style={{ color: '#e6007e', fontWeight: 600, marginBottom: 10 }}>
                  Simulação do Login
                </h5>
                <div style={{ 
                  background: '#fff', 
                  padding: '15px', 
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  marginBottom: 15
                }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Login EDURATS</div>
                  <div style={{ 
                    background: '#f8f9fa', 
                    padding: '8px', 
                    borderRadius: '4px',
                    marginBottom: 10,
                    fontSize: 14
                  }}>
                    📧 aluno@email.com
                  </div>
                  <div style={{ 
                    background: '#f8f9fa', 
                    padding: '8px', 
                    borderRadius: '4px',
                    marginBottom: 10,
                    fontSize: 14
                  }}>
                    🔒 ••••••••
                  </div>
                  <Button size="sm" variant="success" style={{ width: '100%' }}>
                    Entrar
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Etapa 2: Dashboard e Progresso */}
      <Card className="gamified-card mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <div style={{ 
                background: 'rgba(239, 125, 0, 0.1)', 
                padding: '20px', 
                borderRadius: '12px',
                border: '2px solid rgba(239, 125, 0, 0.3)',
                marginBottom: 20
              }}>
                <h4 style={{ color: '#ef7d00', fontWeight: 700, marginBottom: 15 }}>
                  📊 Etapa 2: Dashboard e Progresso
                </h4>
                <div style={{ fontSize: 16, marginBottom: 15 }}>
                  <strong>Após o login, você verá:</strong>
                </div>
                <ul style={{ fontSize: 14, color: '#666' }}>
                  <li><strong>Nível e Progresso:</strong> Seu nível atual e barra de progresso</li>
                  <li><strong>XP e Progresso:</strong> Pontos de experiência e barra de progresso</li>
                  <li><strong>Ranking Pessoal:</strong> Sua posição entre todos os estudantes</li>
                  <li><strong>Ranking da Turma:</strong> Posição da sua turma no ranking geral</li>
                  <li><strong>Timer:</strong> Tempo até a próxima questão disponível</li>
                </ul>
              </div>
            </Col>
            <Col md={6}>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '12px',
                border: '2px solid #dee2e6'
              }}>
                <h5 style={{ color: '#ef7d00', fontWeight: 600, marginBottom: 15, textAlign: 'center' }}>
                  Simulação do Dashboard
                </h5>
                
                {/* Simulação do painel superior */}
                <div style={{ 
                  background: 'linear-gradient(135deg, #fff8f0, #fff0f8)', 
                  padding: '10px', 
                  borderRadius: '8px',
                  border: '2px solid #ef7d00',
                  marginBottom: 15
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <div style={{ 
                      width: 28, 
                      height: 28, 
                      borderRadius: '50%', 
                      background: '#e6007e', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: '#fff', 
                      fontWeight: 700, 
                      fontSize: 14 
                    }}>
                      1
                    </div>
                    <div style={{ fontSize: 9 }}>Nível 1</div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: '#ef7d00' }}>XP: 25</div>
                    <ProgressBar now={25} max={50} style={{ height: 5, width: 60 }} />
                  </div>
                </div>

                {/* Simulação do navbar */}
                <div style={{ 
                  background: '#343a40', 
                  padding: '10px', 
                  borderRadius: '8px',
                  color: '#fff',
                  marginBottom: 15
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 700 }}>EDURATS</div>
                    <div style={{ 
                      background: 'rgba(149,193,31,0.3)', 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      fontSize: 12
                    }}>
                      DIA 02/04 ⏰ 14:30
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <span style={{ fontSize: 12 }}>Início</span>
                      <span style={{ fontSize: 12 }}>Quiz</span>
                      <span style={{ fontSize: 12 }}>Ranking</span>
                    </div>
                  </div>
                </div>

                {/* Simulação do ranking */}
                <div style={{ 
                  background: '#fff', 
                  padding: '10px', 
                  borderRadius: '8px',
                  border: '1px solid #dee2e6'
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>🏆 Ranking da Turma</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                    <span>👤 João Silva</span>
                    <span>#3</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                    <span>🏫 3ª Série A</span>
                    <span>#2</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Etapa 3: Sistema de Níveis */}
      <Card className="gamified-card mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <div style={{ 
                background: 'rgba(149, 193, 31, 0.1)', 
                padding: '20px', 
                borderRadius: '12px',
                border: '2px solid rgba(149, 193, 31, 0.3)',
                marginBottom: 20
              }}>
                <h4 style={{ color: '#95c11f', fontWeight: 700, marginBottom: 15 }}>
                  🎯 Etapa 3: Sistema de Níveis
                </h4>
                <div style={{ fontSize: 16, marginBottom: 15 }}>
                  <strong>Como funciona o progresso:</strong>
                </div>
                <ul style={{ fontSize: 14, color: '#666' }}>
                  <li><strong>Nível 1:</strong> Iniciante - cor rosa</li>
                  <li><strong>Níveis 2-3:</strong> Intermediário - cor laranja</li>
                  <li><strong>Nível 4+:</strong> Avançado - cor cinza</li>
                  <li><strong>XP por acerto:</strong> +50 pontos</li>
                  <li><strong>XP por erro:</strong> -10 pontos</li>
                  <li><strong>XP por atraso:</strong> -5 pontos adicionais</li>
                  <li><strong>XP para próximo nível:</strong> 50 pontos</li>
                </ul>
              </div>
            </Col>
            <Col md={6}>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '12px',
                border: '2px solid #dee2e6'
              }}>
                <h5 style={{ color: '#95c11f', fontWeight: 600, marginBottom: 15, textAlign: 'center' }}>
                  Simulação dos Níveis
                </h5>
                
                {/* Nível 1 */}
                <div style={{ 
                  background: '#fff', 
                  padding: '15px', 
                  borderRadius: '8px',
                  border: '2px solid #e6007e',
                  marginBottom: 15
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ 
                      width: 50, 
                      height: 50, 
                      borderRadius: '50%', 
                      background: '#e6007e', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: '#fff', 
                      fontWeight: 700, 
                      fontSize: 24 
                    }}>
                      1
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#e6007e' }}>Nível 1</div>
                      <div style={{ fontSize: 12, color: '#666' }}>XP: 25/50</div>
                      <ProgressBar now={25} max={50} style={{ height: 8 }} />
                    </div>
                  </div>
                </div>

                {/* Nível 2 */}
                <div style={{ 
                  background: '#fff', 
                  padding: '15px', 
                  borderRadius: '8px',
                  border: '2px solid #ef7d00',
                  marginBottom: 15
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ 
                      width: 50, 
                      height: 50, 
                      borderRadius: '50%', 
                      background: '#ef7d00', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: '#fff', 
                      fontWeight: 700, 
                      fontSize: 24 
                    }}>
                      2
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#ef7d00' }}>Nível 2</div>
                      <div style={{ fontSize: 12, color: '#666' }}>XP: 75/50</div>
                      <ProgressBar now={25} max={50} style={{ height: 8 }} />
                    </div>
                  </div>
                </div>

                {/* Nível 4 */}
                <div style={{ 
                  background: '#fff', 
                  padding: '15px', 
                  borderRadius: '8px',
                  border: '2px solid #6c757d'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ 
                      width: 50, 
                      height: 50, 
                      borderRadius: '50%', 
                      background: '#6c757d', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: '#fff', 
                      fontWeight: 700, 
                      fontSize: 24 
                    }}>
                      4
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#6c757d' }}>Nível 4</div>
                      <div style={{ fontSize: 12, color: '#666' }}>XP: 175/50</div>
                      <ProgressBar now={25} max={50} style={{ height: 8 }} />
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Etapa 4: Quiz e Questões */}
      <Card className="gamified-card mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <div style={{ 
                background: 'rgba(230, 0, 126, 0.1)', 
                padding: '20px', 
                borderRadius: '12px',
                border: '2px solid rgba(230, 0, 126, 0.3)',
                marginBottom: 20
              }}>
                <h4 style={{ color: '#e6007e', fontWeight: 700, marginBottom: 15 }}>
                  📚 Etapa 4: Quiz e Questões
                </h4>
                <div style={{ fontSize: 16, marginBottom: 15 }}>
                  <strong>Como funciona o sistema de questões:</strong>
                </div>
                <ul style={{ fontSize: 14, color: '#666' }}>
                  <li><strong>Questões Diárias:</strong> Novas questões a cada dia</li>
                  <li><strong>Timer:</strong> Tempo limitado para responder</li>
                  <li><strong>Dicas:</strong> Ajudas para facilitar o aprendizado</li>
                  <li><strong>Imagens:</strong> Questões podem incluir imagens</li>
                  <li><strong>5 Alternativas:</strong> A, B, C, D, E</li>
                  <li><strong>Feedback Imediato:</strong> Resultado instantâneo</li>
                  <li><strong>Dicas da Próxima:</strong> Preview da próxima questão</li>
                </ul>
              </div>
            </Col>
            <Col md={6}>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '12px',
                border: '2px solid #dee2e6'
              }}>
                <h5 style={{ color: '#e6007e', fontWeight: 600, marginBottom: 15, textAlign: 'center' }}>
                  Simulação do Quiz
                </h5>
                
                <div style={{ 
                  background: '#fff', 
                  padding: '15px', 
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  marginBottom: 15
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
                    📚 Questão do Dia 2
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 15 }}>
                    Qual foi a primeira capital da Bahia?
                  </div>
                  <div style={{ fontSize: 10, color: '#666', marginBottom: 10 }}>
                    💡 Dica: Foi fundada em 1549
                  </div>
                  
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ 
                      background: 'rgba(149, 193, 31, 0.1)', 
                      padding: '8px', 
                      borderRadius: '4px',
                      border: '2px solid #95c11f',
                      fontSize: 12
                    }}>
                      A) Salvador
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ 
                      background: '#f8f9fa', 
                      padding: '8px', 
                      borderRadius: '4px',
                      fontSize: 12
                    }}>
                      B) Cachoeira
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ 
                      background: '#f8f9fa', 
                      padding: '8px', 
                      borderRadius: '4px',
                      fontSize: 12
                    }}>
                      C) Feira de Santana
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ 
                      background: '#f8f9fa', 
                      padding: '8px', 
                      borderRadius: '4px',
                      fontSize: 12
                    }}>
                      D) Ilhéus
                    </div>
                  </div>
                  <div style={{ marginBottom: 15 }}>
                    <div style={{ 
                      background: '#f8f9fa', 
                      padding: '8px', 
                      borderRadius: '4px',
                      fontSize: 12
                    }}>
                      E) Vitória da Conquista
                    </div>
                  </div>
                  
                  <Button size="sm" variant="success" style={{ width: '100%' }}>
                    Responder
                  </Button>
                </div>

                <Alert variant="success" style={{ fontSize: 12 }}>
                  <strong>✅ Correto!</strong> Você ganhou 50 XP!<br/>
                  💡 Dica da próxima: Pense na história do Brasil colonial...
                </Alert>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Etapa 5: Ranking e Competição */}
      <Card className="gamified-card mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <div style={{ 
                background: 'rgba(239, 125, 0, 0.1)', 
                padding: '20px', 
                borderRadius: '12px',
                border: '2px solid rgba(239, 125, 0, 0.3)',
                marginBottom: 20
              }}>
                <h4 style={{ color: '#ef7d00', fontWeight: 700, marginBottom: 15 }}>
                  🏆 Etapa 5: Ranking e Competição
                </h4>
                <div style={{ fontSize: 16, marginBottom: 15 }}>
                  <strong>Como funciona a competição:</strong>
                </div>
                <ul style={{ fontSize: 14, color: '#666' }}>
                  <li><strong>Ranking Pessoal:</strong> Sua posição entre todos os estudantes</li>
                  <li><strong>Ranking da Turma:</strong> Posição da sua turma no ranking geral</li>
                  <li><strong>Score Global:</strong> XP × Participação</li>
                  <li><strong>Top 3 Turmas:</strong> Pódio das melhores turmas</li>
                  <li><strong>Atualização em Tempo Real:</strong> Rankings atualizados a cada minuto</li>
                  <li><strong>Competição Saudável:</strong> Motivação para estudar mais</li>
                </ul>
              </div>
            </Col>
            <Col md={6}>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '12px',
                border: '2px solid #dee2e6'
              }}>
                <h5 style={{ color: '#ef7d00', fontWeight: 600, marginBottom: 15, textAlign: 'center' }}>
                  Simulação do Ranking
                </h5>
                
                {/* Top 3 Turmas */}
                <div style={{ 
                  background: '#fff', 
                  padding: '15px', 
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  marginBottom: 15
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, textAlign: 'center' }}>
                    🏆 Top 3 Turmas
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 15 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        background: '#ef7d00', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: '#fff', 
                        fontWeight: 700, 
                        fontSize: 18,
                        margin: '0 auto 5px'
                      }}>
                        🥇
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 600 }}>3ª Série A</div>
                      <div style={{ fontSize: 8, color: '#666' }}>Score: 1450</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        background: '#e6007e', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: '#fff', 
                        fontWeight: 700, 
                        fontSize: 18,
                        margin: '0 auto 5px'
                      }}>
                        🥈
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 600 }}>3ª Série B</div>
                      <div style={{ fontSize: 8, color: '#666' }}>Score: 1380</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        background: '#95c11f', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: '#fff', 
                        fontWeight: 700, 
                        fontSize: 18,
                        margin: '0 auto 5px'
                      }}>
                        🥉
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 600 }}>2ª Série A</div>
                      <div style={{ fontSize: 8, color: '#666' }}>Score: 1320</div>
                    </div>
                  </div>
                </div>

                {/* Ranking Pessoal */}
                <div style={{ 
                  background: '#fff', 
                  padding: '15px', 
                  borderRadius: '8px',
                  border: '1px solid #dee2e6'
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
                    👤 Seu Ranking Pessoal
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '8px', 
                    background: 'rgba(239,125,0,0.1)',
                    borderRadius: '4px'
                  }}>
                    <div style={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      background: '#ef7d00', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: '#fff', 
                      fontWeight: 700, 
                      fontSize: 12,
                      marginRight: 10
                    }}>
                      3
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>João Silva</div>
                      <div style={{ fontSize: 10, color: '#666' }}>3ª Série A</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Badge bg="warning" text="dark" style={{ fontSize: 8 }}>
                        25 XP
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Etapa 6: Minha Turma */}
      <Card className="gamified-card mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <div style={{ 
                background: 'rgba(149, 193, 31, 0.1)', 
                padding: '20px', 
                borderRadius: '12px',
                border: '2px solid rgba(149, 193, 31, 0.3)',
                marginBottom: 20
              }}>
                <h4 style={{ color: '#95c11f', fontWeight: 700, marginBottom: 15 }}>
                  👥 Etapa 6: Ranking da Turma
                </h4>
                <div style={{ fontSize: 16, marginBottom: 15 }}>
                  <strong>O que você encontra na página de ranking:</strong>
                </div>
                <ul style={{ fontSize: 14, color: '#666' }}>
                  <li><strong>Ranking Geral:</strong> Top 3 turmas com melhor score</li>
                  <li><strong>Estatísticas da Turma:</strong> Média XP, participação e posição</li>
                  <li><strong>Top 3 da Turma:</strong> Melhores estudantes da sua turma</li>
                  <li><strong>Lista Completa:</strong> Todos os estudantes com suas posições</li>
                  <li><strong>Progresso Individual:</strong> XP e desafios completados de cada um</li>
                  <li><strong>Competição Interna:</strong> Ranking dentro da sua turma</li>
                </ul>
              </div>
            </Col>
            <Col md={6}>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '12px',
                border: '2px solid #dee2e6'
              }}>
                <h5 style={{ color: '#95c11f', fontWeight: 600, marginBottom: 15, textAlign: 'center' }}>
                  Simulação da Página de Ranking
                </h5>
                
                {/* Estatísticas */}
                <div style={{ 
                  background: '#fff', 
                  padding: '15px', 
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  marginBottom: 15
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
                    📊 Estatísticas da Turma
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#ef7d00' }}>25</div>
                      <div style={{ fontSize: 8, color: '#666' }}>Média XP</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#e6007e' }}>85%</div>
                      <div style={{ fontSize: 8, color: '#666' }}>Participação</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#95c11f' }}>#2</div>
                      <div style={{ fontSize: 8, color: '#666' }}>Posição Geral</div>
                    </div>
                  </div>
                </div>

                {/* Top 3 da Turma */}
                <div style={{ 
                  background: '#fff', 
                  padding: '15px', 
                  borderRadius: '8px',
                  border: '1px solid #dee2e6'
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
                    🏆 Top 3 da Turma
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        width: 30, 
                        height: 30, 
                        borderRadius: '50%', 
                        background: '#ef7d00', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: '#fff', 
                        fontWeight: 700, 
                        fontSize: 14,
                        margin: '0 auto 5px'
                      }}>
                        🥇
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 600 }}>Maria</div>
                      <div style={{ fontSize: 8, color: '#666' }}>45 XP</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        width: 30, 
                        height: 30, 
                        borderRadius: '50%', 
                        background: '#e6007e', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: '#fff', 
                        fontWeight: 700, 
                        fontSize: 14,
                        margin: '0 auto 5px'
                      }}>
                        🥈
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 600 }}>Pedro</div>
                      <div style={{ fontSize: 8, color: '#666' }}>35 XP</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        width: 30, 
                        height: 30, 
                        borderRadius: '50%', 
                        background: '#95c11f', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: '#fff', 
                        fontWeight: 700, 
                        fontSize: 14,
                        margin: '0 auto 5px'
                      }}>
                        🥉
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 600 }}>Ana</div>
                      <div style={{ fontSize: 8, color: '#666' }}>30 XP</div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Dicas e Benefícios */}
      <Card className="gamified-card mb-4">
        <Card.Body>
          <Row>
            <Col md={12}>
              <div style={{ 
                background: 'rgba(230, 0, 126, 0.1)', 
                padding: '20px', 
                borderRadius: '12px',
                border: '2px solid rgba(230, 0, 126, 0.3)',
                marginBottom: 20
              }}>
                <h4 style={{ color: '#e6007e', fontWeight: 700, marginBottom: 15 }}>
                  💡 Dicas para Sucesso
                </h4>
                <ul style={{ fontSize: 14, color: '#666' }}>
                  <li><strong>Responda rapidamente:</strong> Evite perder XP por atraso</li>
                  <li><strong>Leia as dicas:</strong> Elas facilitam o aprendizado</li>
                  <li><strong>Participe diariamente:</strong> Mantenha consistência</li>
                  <li><strong>Observe o timer:</strong> Fique atento ao tempo</li>
                  <li><strong>Competição saudável:</strong> Motive seus colegas</li>
                  <li><strong>Aprenda com erros:</strong> Cada erro é uma oportunidade</li>
                </ul>
              </div>
            </Col>

          </Row>
        </Card.Body>
      </Card>

      {/* Call to Action */}
      <Card className="gamified-card">
        <Card.Body style={{ textAlign: 'center' }}>
          <h3 style={{ fontWeight: 700, color: '#ef7d00', marginBottom: 20 }}>
            🚀 Pronto para Começar?
          </h3>
          <p style={{ fontSize: 18, color: '#666', marginBottom: 30 }}>
            Agora que você entende como funciona, que tal começar sua jornada de aprendizado?
          </p>
          <div style={{ display: 'flex', gap: 15, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="success" 
              size="lg" 
              className="gamified-btn"
              style={{ fontSize: 16, padding: '12px 30px' }}
              onClick={() => {
                if (user && user.login) {
                  window.location.href = '/quiz';
                } else {
                  setShowLoginModal(true);
                }
              }}
            >
              🎯 Ir para o Quiz
            </Button>
            <Button 
              variant="warning" 
              size="lg" 
              className="gamified-btn"
              style={{ fontSize: 16, padding: '12px 30px' }}
              onClick={() => {
                if (user && user.login) {
                  window.location.href = '/ranking';
                } else {
                  setShowLoginModal(true);
                }
              }}
            >
              🏆 Ver Ranking
            </Button>
          </div>
        </Card.Body>
      </Card>

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