export const config = {
  appSubUrl: '',
};

export const getBackendSrv = () => ({
  get: jest.fn(),
  post: jest.fn(),
});
