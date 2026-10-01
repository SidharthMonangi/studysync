// @vitest-environment jsdom
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react'
import { beforeEach, afterEach, it, expect, vi } from 'vitest'
import PomodoroPage from '../src/pages/dashboard/PomodoroPage'
const mocks=vi.hoisted(()=>({record:vi.fn(async()=>{}),save:vi.fn(async()=>{}),success:vi.fn(),error:vi.fn()}))
vi.mock('@/context/PomodoroStore',()=>({usePomodoro:()=>({pomodoroSettings:{focus:1,shortBreak:1,longBreak:2,sessionsBeforeLongBreak:4},pomodoroSessions:[],recordFocusSessionComplete:mocks.record,setPomodoroSettings:mocks.save})}))
vi.mock('@/context/TasksStore',()=>({useTasks:()=>({tasks:[]})}))
vi.mock('@/hooks/ToastStore',()=>({useToast:()=>({success:mocks.success,error:mocks.error})}))
beforeEach(()=>{vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-02T10:00:00Z'));mocks.record.mockClear()})
afterEach(()=>{cleanup();vi.useRealTimers()})
it('pauses without losing elapsed time and resumes from the same point',()=>{
  render(<PomodoroPage />);fireEvent.click(screen.getByRole('button',{name:/start/i}));act(()=>vi.advanceTimersByTime(10000));expect(screen.getByText('00:50')).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:/pause/i}));act(()=>vi.advanceTimersByTime(10000));expect(screen.getByText('00:50')).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:/start|resume/i}));act(()=>vi.advanceTimersByTime(5000));expect(screen.getByText('00:45')).toBeTruthy()
})
it('records a completed focus session once and switches to a break',async()=>{
  render(<PomodoroPage />);fireEvent.click(screen.getByRole('button',{name:/start/i}));await act(async()=>vi.advanceTimersByTime(60000));expect(mocks.record).toHaveBeenCalledTimes(1);expect(mocks.record).toHaveBeenCalledWith(1);act(()=>vi.advanceTimersByTime(3000));expect(mocks.record).toHaveBeenCalledTimes(1)
})
