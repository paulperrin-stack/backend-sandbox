const prisma = require('../db');
const { getAll, getOne, create, update, remove } = require('../controllers/item.controller');

const mockRes = () => ({
    status: jest.fn().mockReturnThis(),
    json:   jest.fn().mockReturnThis(),
});
const mockNext = jest.fn();

beforeEach(() => jest.clearAllMocks());

describe('getAll', () => {
    it('returns all items', async () => {
        const items = [{ id: 1, name: 'Hammer' }];
        prisma.item.findMany.mockResolvedValue(items);

        const res = mockRes();
        await getAll({}, res, mockNext);

        expect(res.json).toHaveBeenCalledWith(items);
    });

    it('calls next on error', async () => {
        const err = new Error('db error');
        prisma.item.findMany.mockRejectedValue(err);

        await getAll({}, mockRes(), mockNext);

        expect(mockNext).toHaveBeenCalledWith(err);
    });
});

describe('getOne', () => {
    it('returns item when found', async () => {
        const item = { id: 1, name: 'Hammer' };
        prisma.item.findUnique.mockResolvedValue(item);

        const res = mockRes();
        await getOne({ id: 1 }, res, mockNext);

        expect(res.json).toHaveBeenCalledWith(item);
    });

    it('returns 404 when not found', async () => {
        prisma.item.findUnique.mockResolvedValue(null);

        const res = mockRes();
        await getOne({ id: 99 }, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Item 99 not found.' });
    });
});

describe('create', () => {
    it('creates and returns 201', async () => {
        const item = { id: 1, name: 'Hammer' };
        prisma.item.create.mockResolvedValue(item);

        const res = mockRes();
        await create({ body: { name: 'Hammer' } }, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(item);
    });
});

describe('remove', () => {
    it('deletes and returns deleted item', async () => {
        const item = { id: 1, name: 'Hammer' };
        prisma.item.delete.mockResolvedValue(item);

        const res = mockRes();
        await remove({ id: 1 }, res, mockNext);

        expect(res.json).toHaveBeenCalledWith({ deleted: item });
    });

    it('calls next on error', async () => {
        const err = Object.assign(new Error(), { code: 'P2025' });
        prisma.item.delete.mockRejectedValue(err);

        await remove({ id: 99 }, mockRes(), mockNext);

        expect(mockNext).toHaveBeenCalledWith(err);
    });
});