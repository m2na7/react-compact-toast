import ToastContainer from './components/toast-container';
import { toast } from './core/toast';

function App() {
  const compactToast = () => toast({
    text: "easy to customize",
    icon: "🚀",
    position: "bottomLeft",
    className: "custom-toast",
  });

  const moreCompactToast = () => toast("compact toast !");


  return (
    <div>
      <button onClick={compactToast}>compactToast</button>
      <button onClick={moreCompactToast}>moreCompactToast</button>
      <ToastContainer />
    </div>
  );
}

export default App;
