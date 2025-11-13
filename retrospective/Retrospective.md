TEMPLATE FOR RETROSPECTIVE (Team 13)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs. done 
    - 4 stories committed --- 4 stories done
- Total points committed vs. done 
    - 14 points committed --- 14 points done
- Nr of hours planned vs. spent (as a team)
    - time estimated: 96h --- time spent: 92h05m

**Remember**a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD if required (you cannot remove items!) 

### Detailed statistics

| Story | # Tasks | Points | Hours est. | Hours actual |
|-------|--------:|-------:|-----------:|-------------:|
| _Uncategorized_ | 14 | - | 45h | 43h48m |
| Citizen registration | 9 | 2 | 11h45m | 10h15m |
| Municipality users setup | 9 | 2 | 10h5m | 10h45m |
| Municipality users role assignment | 10 | 2 | 10h5m | 8h47m |
| Location selection | 12 | 8 | 19h5m | 18h30m |
| **Total** | 54 | 14 | **96h** | **92h05m** |


> story `Uncategorized` is for technical tasks, leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)

|            | Mean | StDev |
|------------|------|-------|
| Estimation | 2h08m | 2h13m | 
| Actual     | 2h20m30s | 2h22m |

- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1$$
  
  **Total Error Ration = 0,0996**
    
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_{task_i}}-1 \right| $$

  **Absolute Relative Error = 0,1583**
  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated: 4h (stories 1 & 2), 2h (story 3, not done)
  - Total hours spent: 3h 56m (stories 1 & 2), 0h (story 3, not done)
  - Nr of automated unit test cases : 212
  - Coverage (Jest report):
    - Statements: 25.92 %
    - Branches: 11.86 %
    - Functions: 16.14 %
    - Lines: 74.45 %
- E2E testing:
  - Total hours estimated: 0h
  - Total hours spent: 0h
  - Nr of test cases: 0
- Integration testing:
  - Total hours estimated: 4h (stories 1 & 2), 2h (story 3, not done) 
  - Total hours spent: 4h 30m (stories 1 & 2), 0h (story 3, not done)
  - Nr of test cases: 26
- Code review 
  - Total hours estimated: 7h (stories 1 & 2), 2h (story 3, not done) 
  - Total hours spent: 11h 40m (stories 1 & 2), 0h (story 3, not done)
  


## ASSESSMENT

- What did go wrong in the sprint?
    - The major problems encountered during the sprint where due to tasks assignment. We can solve this problem with a better task definition during sprint planning and also assigning the same person to small backend tasks of the same story, in order to reduce waiting times

- What caused your errors in estimation (if any)?
    - The major overstimation errors are bound to uncategorized decision tasks (architecture design, technologies choice, etc) and DB updates tasks. The former where due to the fact that many decisions where almost directly inherited from the previous project. The latter, instead, where caused by the fact that in some stories a DB update was not really required.
    Finally, we have to start every task from the swagger and pay more attention on implementing only things that actually belongs to our stories.

- What lessons did you learn (both positive and negative) in this sprint?
    - We realized that we need to improve task descriptions during sprint planning, but overall our time estimation was quite precise.

- Which improvement goals set in the previous retrospective were you able to achieve? 
    - First sprint, no previous set goals
  
- Which ones you were not able to achieve? Why?
    - First sprint, no previous set goals

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

  > Propose one or two
  - Improve task definition and description during sprint planning in orderd to a better understanding of the work to do.
  - Always start development of stories from swagger in order to improve team alignment.

- One thing you are proud of as a Team!!
  - We kept an excellent level of communication, always updating each other on the status of the project and giving feedback on others work