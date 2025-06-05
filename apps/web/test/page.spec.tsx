import { afterAll, describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react';

import RootPage from '../src/app/page';

// TODO
// window.fetch = jest.fn().mockImplementation(() =>
//   Promise.resolve({
//     ok: true,
//     json: () => [],
//   })
// );

describe('Root page', () => {
  const { container, unmount } = render(<RootPage />);

  it('should match the snapshot', () => {
    expect(container).toMatchSnapshot();
  });

  it('should have the correct tree parent', () => {
    expect(container).toBeInstanceOf(HTMLDivElement);
  });

  afterAll(() => {
    unmount();
  });
});
