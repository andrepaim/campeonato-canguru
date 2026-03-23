# Campeonato Canguru — Build Specification

## App Purpose
Daily math quiz game for Vitor (age 9) studying for Canguru de Matemática (Ecolier level).
Framed as Brasileirão: Atlético Mineiro vs Serie A opponents.

## Final Architecture (post-review)
- 6 questions per match: 2 easy + 2 medium + 2 hard
- Correct + FAST (under 10s) = 2 goals for CAM
- Correct + SLOW = 1 goal for CAM  
- Wrong = 0 goals (no punishment)
- Skip = 0 goals
- Opponent scores 0-3 goals randomly per match (simulated)
- Final score = CAM goals vs opponent simulated goals
- Win (CAM > opp) = 3pts, Draw = 1pt, Loss = 0pts

## Data Source
Questions: https://rotinadoatleticano.duckdns.org/canguru/questions.json
Page images: https://rotinadoatleticano.duckdns.org/canguru/pages/YYYY/page-N.jpg
Question images: https://rotinadoatleticano.duckdns.org/canguru/questions/YYYY-E-NN.jpg

## Serie A Teams
atletico-mg (player), flamengo, palmeiras, sao-paulo, internacional, gremio,
fluminense, corinthians, athletico-pr, bahia, bragantino, vasco, botafogo,
cruzeiro, fortaleza, cuiaba, juventude, criciuma, vitoria, atletico-go

## Routes
/ → Home (today's match card, mini table, stats)
/match → Active match (scoreboard + question + timer)
/result → Match result screen
/standings → Full 20-team table
/history → Past matches list

## State (Zustand + localStorage persist)
- matchDay: number (increments each real day)
- lastPlayedDate: string (YYYY-MM-DD, prevents double play)
- matches: Match[] (history)
- standings: TeamStanding[] (accumulated table)
- usedQuestionIds: string[]

## Key UX Rules
- One match per calendar day
- Timer visible (10s countdown per question, green→yellow→red)
- Goal celebration: full-screen flash (green for CAM goal, neutral for skip)
- "GOOOL DO GALO!" with ball emoji animation
- Match result: stadium-style final whistle
- Table: Atlético row highlighted in gold
- Simulated other team matches each round to keep table alive
