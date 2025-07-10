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

      const req: any = { body: registerData };
      await AuthController.register(req, res);

      expect(AuthService.register).toHaveBeenCalledWith(registerData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        ...mockResult,
      });
    });

    it('should handle registration error and return 400', async () => {
      const error = new Error('Email already exists');
      (AuthService.register as jest.Mock).mockRejectedValue(error);

      const req: any = { body: registerData };
      await AuthController.register(req, res);

      expect(AuthService.register).toHaveBeenCalledWith(registerData);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email already exists',
      });
    });

    it('should handle validation errors', async () => {
      const error = new Error('Invalid email format');
      (AuthService.register as jest.Mock).mockRejectedValue(error);

      const req: any = { body: { email: 'invalid-email' } };
      await AuthController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid email format',
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

      const req: any = { body: loginData };
      await AuthController.login(req, res);

      expect(AuthService.login).toHaveBeenCalledWith(loginData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        ...mockResult,
      });
    });

    it('should handle login error and return 401', async () => {
      const error = new Error('Invalid credentials');
      (AuthService.login as jest.Mock).mockRejectedValue(error);

      const req: any = { body: loginData };
      await AuthController.login(req, res);

      expect(AuthService.login).toHaveBeenCalledWith(loginData);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid credentials',
      });
    });

    it('should handle user not found', async () => {
      const error = new Error('User not found');
      (AuthService.login as jest.Mock).mockRejectedValue(error);

      const req: any = { body: { email: 'nonexistent@example.com', password: 'wrong' } };
      await AuthController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not found',
      });
    });

    it('should handle wrong password', async () => {
      const error = new Error('Invalid password');
      (AuthService.login as jest.Mock).mockRejectedValue(error);

      const req: any = { body: { email: 'test@example.com', password: 'wrongpassword' } };
      await AuthController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid password',
      });
    });
  });
});
