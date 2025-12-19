export interface MockObject {
  id: string;
  name: string;
  type: string;
  plate?: string;
}

export const MOCK_OBJECTS: MockObject[] = [
  {
    id: 'obj_001',
    name: 'Mercedes-Benz Sprinter',
    type: 'Vehicle',
    plate: 'A001BC',
  },
  {
    id: 'obj_002',
    name: 'Volvo FH16',
    type: 'Vehicle',
    plate: 'B002CD',
  },
  {
    id: 'obj_003',
    name: 'Warehouse A',
    type: 'Storage',
  },
  {
    id: 'obj_004',
    name: 'Forklift 01',
    type: 'Equipment',
  },
  {
    id: 'obj_005',
    name: 'Container 5000L',
    type: 'Container',
  },
];
