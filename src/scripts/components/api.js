const config = {
  baseUrl: "https://mesto.nomoreparties.co/v1/apf-cohort-203",
  headers: {
    authorization: "559bc721-1553-4866-a82a-174604b20094",
    "Content-Type": "application/json",
  },
};

/* Проверяем, успешно ли выполнен запрос, и отклоняем промис в случае ошибки. */
const getResponseData = (res) => {
  return res.ok ? res.json() : Promise.reject(`Ошибка: ${res.status}`);
};

export async function getUserInfo() {
  const res = await fetch(`${config.baseUrl}/users/me`, {
    headers: config.headers,
  });
  return getResponseData(res);
}

export async function getCardList() {
  const res = await fetch(`${config.baseUrl}/cards`, {
    headers: config.headers,
  });
  return getResponseData(res);
}

export async function setUserInfo({ name, about }) {
  const res = await fetch(`${config.baseUrl}/users/me`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({ name, about }),
  });
  return getResponseData(res);
}

export async function setUserAvatar(avatar) {
  const res = await fetch(`${config.baseUrl}/users/me/avatar`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({ avatar }),
  });
  return getResponseData(res);
}

export async function addCard({ name, link }) {
  const res = await fetch(`${config.baseUrl}/cards`, {
    method: "POST",
    headers: config.headers,
    body: JSON.stringify({ name, link }),
  });
  return getResponseData(res);
}

export async function deleteCardFromServer(cardId) {
  const res = await fetch(`${config.baseUrl}/cards/${cardId}`, {
    method: "DELETE",
    headers: config.headers,
  });
  return getResponseData(res);
}

export async function changeLikeCardStatus(cardId, isLiked) {
  const res = await fetch(`${config.baseUrl}/cards/likes/${cardId}`, {
    method: isLiked ? "DELETE" : "PUT",
    headers: config.headers,
  });
  return getResponseData(res);
}