minimumFreq = 100
maximumFreq = 1000
levelsCount = [3, 4, 5, 6, 7, 8, 9, 10, 12, 15]
#levelsCount = [4, 7, 10, 14]
import numpy as np


for levels in levelsCount:
    preferedFactor = 0
    for factor in np.arange(1.1, 5.0, 0.1):
        largestFreq = minimumFreq * factor ** (levels - 1)
        if largestFreq > maximumFreq:
            preferedFactor = factor - 0.1
            break
    print ("levels = ", levels, ", preferedFactor = ", preferedFactor)
    
    
    values = [] #minimumFreq]
    for stepsize in range(levels):
        values.append(minimumFreq * preferedFactor ** stepsize)
    print (values)
    