import { requirePerfil } from '../../src/middleware/auth';
import { Request, Response, NextFunction } from 'express';

describe('Middleware de Autorização', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  
  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });
  
  describe('requirePerfil', () => {
    test('deve permitir acesso quando perfil está na lista permitida', () => {
      (mockRequest as any).user = {
        id: 'user-001',
        email: 'test@example.com',
        perfil: 'edicao',
      };
      
      const middleware = requirePerfil(['edicao', 'admin']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
    
    test('deve bloquear acesso quando perfil não está na lista permitida', () => {
      (mockRequest as any).user = {
        id: 'user-001',
        email: 'test@example.com',
        perfil: 'consulta', // Perfil não permitido
      };
      
      const middleware = requirePerfil(['edicao']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Acesso negado'),
          perfilAtual: 'consulta',
        })
      );
    });
    
    test('deve retornar 401 quando usuário não está autenticado', () => {
      (mockRequest as any).user = undefined;
      
      const middleware = requirePerfil(['edicao']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Não autenticado',
        })
      );
    });
    
    test('deve permitir acesso quando perfil consulta tenta acessar recurso de consulta', () => {
      (mockRequest as any).user = {
        id: 'user-001',
        email: 'test@example.com',
        perfil: 'consulta',
      };
      
      // Perfil consulta pode acessar recursos de consulta
      const middleware = requirePerfil(['consulta', 'edicao']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });
    
    test('deve bloquear perfil consulta de recursos de edição', () => {
      (mockRequest as any).user = {
        id: 'user-001',
        email: 'test@example.com',
        perfil: 'consulta',
      };
      
      // Perfil consulta NÃO pode acessar recursos de edição
      const middleware = requirePerfil(['edicao']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });
  });
});
