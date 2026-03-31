/**
 * Simple line-by-line diff utility for comparing JSON strings.
 * This computes a basic unified diff (additions, deletions, unchanged).
 */

export const computeDiff = (oldStr, newStr) => {
  if (typeof oldStr !== 'string') oldStr = JSON.stringify(oldStr, null, 2);
  if (typeof newStr !== 'string') newStr = JSON.stringify(newStr, null, 2);

  const oldLines = oldStr.split('\n');
  const newLines = newStr.split('\n');
  
  const diff = [];
  let i = 0; // index for oldLines
  let j = 0; // index for newLines

  // Basic diff algorithm with a small lookahead for synchronizing
  while (i < oldLines.length || j < newLines.length) {
    const lineOld = oldLines[i];
    const lineNew = newLines[j];

    if (i < oldLines.length && j < newLines.length && lineOld === lineNew) {
      diff.push({ type: 'unchanged', value: lineOld });
      i++;
      j++;
    } else {
      // Check if we can find lineOld in newLines somewhere ahead
      let foundInNew = -1;
      for (let k = j + 1; k < Math.min(j + 10, newLines.length); k++) {
        if (newLines[k] === lineOld) {
          foundInNew = k;
          break;
        }
      }

      if (foundInNew !== -1) {
        // All lines from j to foundInNew-1 are additions
        for (let k = j; k < foundInNew; k++) {
          diff.push({ type: 'added', value: newLines[k] });
        }
        j = foundInNew;
      } else {
        // Check if we can find lineNew in oldLines somewhere ahead
        let foundInOld = -1;
        for (let k = i + 1; k < Math.min(i + 10, oldLines.length); k++) {
          if (oldLines[k] === lineNew) {
            foundInOld = k;
            break;
          }
        }

        if (foundInOld !== -1) {
          // All lines from i to foundInOld-1 are deletions
          for (let k = i; k < foundInOld; k++) {
            diff.push({ type: 'removed', value: oldLines[k] });
          }
          i = foundInOld;
        } else {
          // Both lines are different, treat as a replacement (Remove then Add)
          if (i < oldLines.length) {
            diff.push({ type: 'removed', value: lineOld });
            i++;
          }
          if (j < newLines.length) {
            diff.push({ type: 'added', value: lineNew });
            j++;
          }
        }
      }
    }
  }

  return diff;
};
