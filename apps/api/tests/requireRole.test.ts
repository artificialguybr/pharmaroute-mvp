import { requireRole } from '../src/middleware/requireRole';

function mockResponse() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('requireRole', () => {
  it('allows requests when role matches', () => {
    const middleware = requireRole('manager');
    const req: any = { userRole: 'manager' };
    const res = mockResponse();
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('blocks requests when role does not match', () => {
    const middleware = requireRole('manager');
    const req: any = { userRole: 'seller' };
    const res = mockResponse();
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
