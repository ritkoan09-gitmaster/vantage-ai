import { Snippet } from '@/types';

export const MOCK_SNIPPETS: Snippet[] = [
  {
    id: '1',
    title: 'Bubble Sort Optimization',
    description: 'Standard bubble sort with a boolean flag check to prevent unnecessary iterations.',
    language: 'JavaScript',
    starred: true,
    copies: 24,
    views: 105,
    tags: ['algorithms', 'sorting'],
    code: `function optimizedBubbleSort(arr) {\n  let swapped;\n  for (let i = 0; i < arr.length - 1; i++) {\n    swapped = false;\n    for (let j = 0; j < arr.length - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        let temp = arr[j];\n        arr[j] = arr[j + 1];\n        arr[j + 1] = temp;\n        swapped = true;\n      }\n    }\n    if (!swapped) break;\n  }\n  return arr;\n}`,
    xray: {
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      explanation: [
        'Iterates through the array comparing adjacent pairs.',
        'Uses a tracking flag to break early if the array becomes sorted mid-execution.',
        'Swaps items in-place using temporary variables.'
      ],
      vulnerabilities: [
        'Extremely inefficient for large data frameworks.',
        'Prone to call stack friction if modified into a recursive sequence.'
      ]
    }
  },
  {
    id: '2',
    title: 'Secure Next.js JWT Verification',
    description: 'Validates JavaScript Web Tokens within Next.js Edge Middleware parameters.',
    language: 'TypeScript',
    starred: false,
    copies: 142,
    views: 310,
    tags: ['auth', 'security', 'nextjs'],
    code: `import { jwtVerify } from 'jose';\n\nexport async function verifyAuthToken(req: Request) {\n  const token = req.headers.get('authorization')?.split(' ')[1];\n  if (!token) throw new Error('Missing token authentication context');\n  \n  try {\n    const { payload } = await jwtVerify(\n      token, \n      new TextEncoder().encode(process.env.JWT_SECRET)\n    );\n    return payload;\n  } catch (err) {\n    throw new Error('Invalid or expired application sequence signature');\n  }\n}`
  }
];