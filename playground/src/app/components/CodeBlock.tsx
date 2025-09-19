import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialOceanic } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  children: string;
  language: string;
  fontSize?: string;
}

export default function CodeBlock({ children, language, fontSize = '12px' }: CodeBlockProps) {
  return (
    <SyntaxHighlighter
      language={language}
      style={materialOceanic}
      customStyle={{
        margin: 0,
        padding: '12px',
        borderRadius: '8px',
        fontSize
      }}
    >
      {children}
    </SyntaxHighlighter>
  );
}