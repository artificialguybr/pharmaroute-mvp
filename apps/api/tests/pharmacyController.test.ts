vi.mock('../src/config/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

import { listPharmacies } from '../src/controllers/pharmacyController';

function mockResponse() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('listPharmacies validation', () => {
  it('returns 400 for invalid bbox', async () => {
    const req: any = {
      query: {
        bbox: 'a,b,c,d',
      },
    };
    const res = mockResponse();

    await listPharmacies(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid bbox format. Expected lat1,lng1,lat2,lng2',
    });
  });
});
