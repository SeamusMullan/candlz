"""

Implement random walk simulation for stock prices.

Random walk is is basically just picking random directions (up or down) for the stock price at each time step.
We can model this with random and just check if its greater than or less than 0.5 to decide the direction. 

"""


import random
from typing import List, Tuple

from backend.market_engine import MarketEngineManager as mem

# instance of the market engine manager
inst = mem.MarketEngineManager()

def random_walk(start_price, steps) -> List[float]:
    price = start_price
    prices = [price]
    for _ in range(steps):
        if random.random() > 0.5:
            price += random.uniform(0, 1)
        else:
            price -= random.uniform(0, 1)
        prices.append(price)
    return prices


def random_walk_lambda(cur_price, asset, steps):
    """
    Random walk lambda function to be used in the market engine.
    """
    inst.setPrice(asset, random_walk(cur_price, steps))