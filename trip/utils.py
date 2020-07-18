
def get_rand(i):
    val = 0.0007
    if i == 1:
        return [-1 * val, -1 * val]
    elif i == 2:
        return [-1 * val, 0]
    elif i == 3:
        return [0,val]
    else:
        return [val, val]
