import { Route, Routes } from 'react-router'
import { RotaProtegida } from './components/sessao/RotaProtegida'
import { Admin } from './pages/Admin'
import { Agenda } from './pages/Agenda'
import { CalendarioConfig } from './pages/CalendarioConfig'
import { CalendarioNovo } from './pages/CalendarioNovo'
import { Cadastro } from './pages/Cadastro'
import { Conta } from './pages/Conta'
import { Entrar } from './pages/Entrar'
import { NaoEncontrada } from './pages/NaoEncontrada'

export function App() {
  return (
    <Routes>
      <Route path="/entrar" element={<Entrar />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/" element={<RotaProtegida><Agenda /></RotaProtegida>} />
      <Route path="/calendarios/novo" element={<RotaProtegida><CalendarioNovo /></RotaProtegida>} />
      <Route path="/calendarios/:id" element={<RotaProtegida><CalendarioConfig /></RotaProtegida>} />
      <Route path="/conta" element={<RotaProtegida><Conta /></RotaProtegida>} />
      <Route path="/admin" element={<RotaProtegida><Admin /></RotaProtegida>} />
      <Route path="*" element={<NaoEncontrada />} />
    </Routes>
  )
}
