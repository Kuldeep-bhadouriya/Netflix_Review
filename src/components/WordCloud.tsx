import { motion } from 'framer-motion'
import type { WordCloudToken } from '../types'

interface WordCloudProps {
  tokens: WordCloudToken[]
}

const rotations = [-6, -3, 0, 3, 6]
const palette = ['text-brand', 'text-white', 'text-brandMuted', 'text-slate-200']

export const WordCloud = ({ tokens }: WordCloudProps) => {
  if (!tokens.length) {
    return <p className="text-sm text-brandMuted">Upload SearchHistory.csv to visualize your search universe.</p>
  }

  const max = Math.max(...tokens.map((token) => token.count))
  const min = Math.min(...tokens.map((token) => token.count))
  const spread = Math.max(max - min, 1)

  return (
    <div className="flex flex-wrap gap-3">
      {tokens.map((token, index) => {
        const relative = (token.count - min) / spread
        const size = 1 + relative * 1.6
        const rotation = rotations[index % rotations.length]
        const color = palette[index % palette.length]
        return (
          <motion.span
            key={`${token.value}-${token.count}`}
            className={`font-display font-semibold ${color}`}
            style={{ fontSize: `${size}rem`, display: 'inline-block' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
          >
            <span style={{ display: 'inline-block', transform: `rotate(${rotation}deg)` }}>{token.value}</span>
          </motion.span>
        )
      })}
    </div>
  )
}
