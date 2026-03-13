vi.mock('../src/config/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

import { getPharmacyVisits } from '../src/controllers/visitController';

function mockResponse() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('getPharmacyVisits validation', () => {
  it('returns 400 for invalid pharmacy uuid', async () => {
    const req: any = {
      params: { pharmacyId: 'not-a-uuid' },
      query: {},
    };
    const res = mockResponse();

    await getPharmacyVisits(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
