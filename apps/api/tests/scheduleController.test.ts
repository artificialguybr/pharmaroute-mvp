const selectSingle = vi.fn();
const updateSingle = vi.fn();

const schedulesQuery = {
  select: vi.fn(() => ({
    eq: vi.fn(() => ({
      single: selectSingle,
    })),
  })),
  update: vi.fn(() => ({
    eq: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: updateSingle,
        })),
      })),
      select: vi.fn(() => ({
        single: updateSingle,
      })),
    })),
  })),
};

vi.mock('../src/config/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(() => schedulesQuery),
  },
}));

import { updateSchedule } from '../src/controllers/scheduleController';

function mockResponse() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('updateSchedule authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks seller from updating another seller schedule', async () => {
    selectSingle.mockResolvedValue({
      data: { id: 'sch-1', seller_id: 'seller-2' },
      error: null,
    });

    const req: any = {
      params: { id: 'sch-1' },
      body: { status: 'completed' },
      userRole: 'seller',
      user: { id: 'seller-1' },
    };
    const res = mockResponse();

    await updateSchedule(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden: cannot update another seller schedule' });
  });

  it('allows manager to update schedule', async () => {
    updateSingle.mockResolvedValue({
      data: { id: 'sch-1', status: 'completed' },
      error: null,
    });

    const req: any = {
      params: { id: 'sch-1' },
      body: { status: 'completed' },
      userRole: 'manager',
      user: { id: 'manager-1' },
    };
    const res = mockResponse();

    await updateSchedule(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ id: 'sch-1', status: 'completed' });
  });
});
