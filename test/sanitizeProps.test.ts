import { sanitizeProps } from '../src/util/sanitizeProps';

describe('Util: sanitizeProps', () => {
  it('is defined', () => {
    // ASSERT
    expect(sanitizeProps).toBeDefined();
  });

  it('can convert shallow props to numbers where needed', () => {
    // ARRANGE
    const mockObj = {
      someString: 'mockSomeString',
      someNumber: '1',
      anotherNumber: '2',
      anotherString: 'mockAnotherString'
    };

    // ACT
    const converted = sanitizeProps(mockObj);

    // ASSERT
    expect(converted).toEqual({
      someString: 'mockSomeString',
      someNumber: 1,
      anotherNumber: 2,
      anotherString: 'mockAnotherString'
    });
  });

  it('can convert deep props to numbers where needed', () => {
    // ARRANGE
    const mockObj = {
      someString: 'mockSomeString',
      someNumber: '1',
      someDeepObject: {
        anotherNumber: '2',
        anotherString: 'mockAnotherString',
        yetAnotherNumber: '3'
      },
      andAnotherNumber: '4'
    };

    // ACT
    const converted = sanitizeProps(mockObj);

    // ASSERT
    expect(converted).toEqual({
      someString: 'mockSomeString',
      someNumber: 1,
      someDeepObject: {
        anotherNumber: 2,
        anotherString: 'mockAnotherString',
        yetAnotherNumber: 3
      },
      andAnotherNumber: 4
    });
  });
});
