import express, { Express, Request, Response } from 'express';
import * as path from 'path';
import { getLyrics, extactLyrics } from './functions/getLyrics';

const app: Express = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req: Request, res: Response) => {
  res.render('index');
});

interface SuggestionsData {
  data: {
    suggestions: Object[];
  };
}

app.get('/search', async (req: Request, res: Response) => {
  const song: string = req.query.query as string;
  const data: SuggestionsData | undefined = await getLyrics(song);
  
  res.json({ data: data?.data?.suggestions ?? [] })
});

app.get('/lyrics', async (req: Request, res: Response) => {
  const pathLyric: string = req.query.query as string;
  const data: undefined | string | object | [] | boolean = await extactLyrics(pathLyric)
  
  res.json({ data: data ?? [] })
})

app.get('*', (req: Request, res: Response) => {  
  res.json({
    Not_Found: 404,
    Your_info: req.headers
  });
});

app.listen(5000, () => {
  console.log('Server running on port 3000');
});


