import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BudgetProvider } from './context/BudgetContext';
import Dashboard from './pages/Dashboard';
import BudgetElements from './pages/BudgetElements';
import BudgetElementForm from './pages/BudgetElementForm'; 
import Savings from './pages/Savings';
import Holders from './pages/Holders';
import Navbar from './components/Navbar';

function App() {
  return (
    <BudgetProvider>
      <Router>
        <div className="min-h-screen bg-dark-bg">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/budget-elements" element={<BudgetElements />} />
              <Route path="/budget-elements/new" element={<BudgetElementForm />} />
              <Route path="/budget-elements/:id" element={<BudgetElementForm />} />
              <Route path="/savings" element={<Savings />} />
              <Route path="/holders" element={<Holders />} />
            </Routes>
          </main>
        </div>
      </Router>
    </BudgetProvider>
  );
}

export default App;
