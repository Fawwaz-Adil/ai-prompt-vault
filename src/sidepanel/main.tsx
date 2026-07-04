import { render } from 'preact';
import { App } from '../ui/App';
import '../ui/styles.css';

render(<App surface="panel" />, document.getElementById('root')!);
