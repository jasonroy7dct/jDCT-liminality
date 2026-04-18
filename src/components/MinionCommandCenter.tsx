import React, { useState } from 'react';
import { Zap, Send, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { MinionTask } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface MinionCommandCenterProps {
  tasks: MinionTask[];
  onExecute: (instruction: string) => Promise<void>;
  accountsCount: number;
  t: (key: any) => string;
}

export function MinionCommandCenter({ tasks, onExecute, accountsCount, t }: MinionCommandCenterProps) {
  const [instruction, setInstruction] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || isExecuting) return;

    setIsExecuting(true);
    await onExecute(instruction);
    setInstruction('');
    setIsExecuting(false);
  };

  return (
    <div className="glass-card p-6 border-t-4 border-plaid-blue">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-plaid-blue/10 rounded-xl text-plaid-blue">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-cool-gray">{t('minionTitle')}</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('minionSubtitle')}</p>
          </div>
        </div>
        {accountsCount === 0 && (
          <button 
            onClick={() => (window as any).seedInitialData?.()}
            className="text-[10px] font-bold text-prism-teal uppercase tracking-widest hover:underline"
          >
            {t('seedDemo')}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative mb-8">
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder={t('placeholderInstruction')}
          className="w-full pl-4 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-plaid-blue/20 transition-all"
          disabled={isExecuting}
        />
        <button
          type="submit"
          disabled={isExecuting || !instruction.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-plaid-blue text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isExecuting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>

      <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-4"
            >
              <div className="mt-1">
                {task.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {task.status === 'FAILED' && <XCircle className="w-4 h-4 text-red-500" />}
                {task.status === 'EXECUTING' && <RefreshCw className="w-4 h-4 text-plaid-blue animate-spin" />}
                {task.status === 'PENDING' && <Clock className="w-4 h-4 text-gray-400" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-cool-gray truncate max-w-[150px]">{task.instruction}</p>
                    {task.autonomousDecision && (
                      <span className="px-1.5 py-0.5 bg-plaid-blue/10 text-plaid-blue text-[8px] font-bold rounded uppercase tracking-tighter">
                        {t('autonomousDecision')}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">{new Date(task.createdAt).toLocaleTimeString()}</span>
                </div>
                {task.reasoning && (
                  <p className="text-[10px] text-gray-400 italic mb-2 leading-tight">
                    {task.reasoning}
                  </p>
                )}
                {task.result && (
                  <p className="text-[10px] text-emerald-600 font-medium leading-relaxed bg-emerald-50 p-2 rounded border border-emerald-100 mt-2">
                    {task.result}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-xs font-medium italic">{t('noActiveMinions')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
