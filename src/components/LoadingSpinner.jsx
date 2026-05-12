import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid rgba(108,92,231,0.2)',
        borderTopColor: '#6C5CE7'
      }}
    />
  </div>
);

export default LoadingSpinner;