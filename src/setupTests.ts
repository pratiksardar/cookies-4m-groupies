// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// Mock window.alert
window.alert = jest.fn();

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    Contract: jest.fn(),
    utils: {
      parseEther: jest.fn((value) => value + '000000000000000000'),
    },
  },
})); 