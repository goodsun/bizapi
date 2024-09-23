const getGenre = () => {
  return [
    {
      id: 1,
      name: "hidasuki",
      delete_flag: 0,
    },
    {
      id: 2,
      name: "sangiri",
      delete_flag: 0,
    },
    {
      id: 3,
      name: "botamochi",
      delete_flag: 0,
    },
    {
      id: 4,
      name: "goma",
      delete_flag: 0,
    },
    {
      id: 5,
      name: "youhen",
      delete_flag: 0,
    },
    {
      id: 6,
      name: "kurobizen",
      delete_flag: 0,
    },
    {
      id: 7,
      name: "shirobizen",
      delete_flag: 0,
    },
    {
      id: 8,
      name: "aobizen",
      delete_flag: 0,
    },
    {
      id: 9,
      name: "other",
      delete_flag: 0,
    },
  ];
};

const getType = () => {
  return [
    {
      id: 1,
      name: "dish",
      delete_flag: 0,
    },
    {
      id: 2,
      name: "bowl",
      delete_flag: 0,
    },
    {
      id: 3,
      name: "riceBowl",
      delete_flag: 0,
    },
    {
      id: 4,
      name: "yunomi",
      delete_flag: 0,
    },
    {
      id: 5,
      name: "cup",
      delete_flag: 0,
    },
    {
      id: 6,
      name: "cupAndSaucer",
      delete_flag: 0,
    },
    {
      id: 7,
      name: "sakeBottle",
      delete_flag: 0,
    },
    {
      id: 8,
      name: "katakuchi",
      delete_flag: 0,
    },
    {
      id: 9,
      name: "guinomi",
      delete_flag: 0,
    },
    {
      id: 10,
      name: "flowerVase",
      delete_flag: 0,
    },
    {
      id: 11,
      name: "vase",
      delete_flag: 0,
    },
    {
      id: 12,
      name: "teaBowl",
      delete_flag: 0,
    },
    {
      id: 13,
      name: "jug",
      delete_flag: 0,
    },
    {
      id: 14,
      name: "box",
      delete_flag: 0,
    },
    {
      id: 15,
      name: "ornament",
      delete_flag: 0,
    },
  ];
};
const constConnect = {
  getGenre,
  getType,
};

export default constConnect;
