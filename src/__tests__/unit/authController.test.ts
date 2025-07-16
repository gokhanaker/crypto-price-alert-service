import { AuthController } from '@/controllers/authController';
import { AuthService } from '@/services/authService';

jest.mock('@/services/authService');

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('AuthController', () => {
  let res: any;

  beforeEach(() => {
    jest.clearAllMocks();
    res = mockRes();
  });

  describe('register', () => {
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should register user successfully and return 201', async () => {
      const mockResult = {
        user: { id: 'user-1', email: 'test@example.com' },
        token: 'test-token',
      };
      (AuthService.register as jest.Mock).mockResolvedValue(mockResult);

      const req: any = { body: registerData, path: '/api/auth/register' };
      await AuthController.register(req, res);

      expect(AuthService.register).toHaveBeenCalledWith(registerData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'User registered successfully',
        timestamp: expect.any(String),
        requestId: expect.any(String),
      });
    });

    it('should handle registration error and return 409', async () => {
      const error = new Error('already exists');
      (AuthService.register as jest.Mock).mockRejectedValue(error);

      const req: any = { body: registerData, path: '/api/auth/register' };
      await AuthController.register(req, res);

      expect(AuthService.register).toHaveBeenCalledWith(registerData);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'AUTH_USER_ALREADY_EXISTS',
          message: 'User with this email already exists',
          details: 'already exists',
          timestamp: expect.any(String),
          requestId: expect.any(String),
          path: '/api/auth/register',
        },
        data: null,
      });
    });

    it('should handle validation errors', async () => {
      const error = new Error('validation failed');
      (AuthService.register as jest.Mock).mockRejectedValue(error);

      const req: any = { body: { email: 'invalid-email' }, path: '/api/auth/register' };
      await AuthController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'ALERT_VALIDATION_ERROR',
          message: 'Invalid registration data provided',
          details: 'validation failed',
          timestamp: expect.any(String),
          requestId: expect.any(String),
          path: '/api/auth/register',
        },
        data: null,
      });
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully and return 200', async () => {
      const mockResult = {
        user: { id: 'user-1', email: 'test@example.com' },
        token: 'test-token',
      };
      (AuthService.login as jest.Mock).mockResolvedValue(mockResult);

      const req: any = { body: loginData, path: '/api/auth/login' };
      await AuthController.login(req, res);

      expect(AuthService.login).toHaveBeenCalledWith(loginData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Login successful',
        timestamp: expect.any(String),
        requestId: expect.any(String),
      });
    });

    it('should handle login error and return 401', async () => {
      const error = new Error('invalid credentials');
      (AuthService.login as jest.Mock).mockRejectedValue(error);

      const req: any = { body: loginData, path: '/api/auth/login' };
      await AuthController.login(req, res);

      expect(AuthService.login).toHaveBeenCalledWith(loginData);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          details: 'invalid credentials',
          timestamp: expect.any(String),
          requestId: expect.any(String),
          path: '/api/auth/login',
        },
        data: null,
      });
    });

    it('should handle user not found', async () => {
      const error = new Error('user not found');
      (AuthService.login as jest.Mock).mockRejectedValue(error);

      const req: any = {
        body: { email: 'nonexistent@example.com', password: 'wrong' },
        path: '/api/auth/login',
      };
      await AuthController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'AUTH_USER_NOT_FOUND',
          message: 'User not found',
          details: 'user not found',
          timestamp: expect.any(String),
          requestId: expect.any(String),
          path: '/api/auth/login',
        },
        data: null,
      });
    });

    it('should handle wrong password', async () => {
      const error = new Error('Invalid password');
      (AuthService.login as jest.Mock).mockRejectedValue(error);

      const req: any = {
        body: { email: 'test@example.com', password: 'wrongpassword' },
        path: '/api/auth/login',
      };
      await AuthController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          details: 'Invalid password',
          timestamp: expect.any(String),
          requestId: expect.any(String),
          path: '/api/auth/login',
        },
        data: null,
      });
    });
  });
});
