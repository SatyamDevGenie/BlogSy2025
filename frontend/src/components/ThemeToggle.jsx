import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from './themeSlice';

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.theme.darkMode);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="p-2 bg-gray-300 dark:bg-gray-700 rounded"
    >
      {darkMode ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
