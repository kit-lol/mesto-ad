export function createCardElement(cardData, handlers) {
  const cardTemplate = document.getElementById("card-template");
  const cardElement = cardTemplate.content.querySelector(".card").cloneNode(true);
  
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCountElement = cardElement.querySelector(".card__like-count");
  const infoButton = cardElement.querySelector(".card__control-button_type_info");

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;
  
  const likesCount = cardData.likes ? cardData.likes.length : 0;
  likeCountElement.textContent = likesCount;

  if (cardData.likes && handlers.currentUserId) {
    const isLikedByMe = cardData.likes.some(user => user._id === handlers.currentUserId);
    if (isLikedByMe) {
      likeButton.classList.add("card__like-button_is-active");
    }
  }

  // Если карточка чужая — полностью удаляем кнопку удаления из DOM
  if (cardData.owner && cardData.owner._id !== handlers.currentUserId) {
    if (deleteButton) deleteButton.remove(); 
  } else if (deleteButton) {
    deleteButton.addEventListener("click", () => {
      handlers.onDeleteCard(cardData._id, cardElement);
    });
  }

  cardImage.addEventListener("click", () => {
    handlers.onPreviewPicture({ name: cardData.name, link: cardData.link });
  });

  likeButton.addEventListener("click", () => {
    const isLiked = likeButton.classList.contains("card__like-button_is-active");
    handlers.onLikeIcon(cardData._id, likeButton, likeCountElement, isLiked);
  });

  if (infoButton && handlers.onInfoClick) {
    infoButton.addEventListener("click", () => {
      handlers.onInfoClick(cardData._id);
    });
  }

  return cardElement;
}

export function deleteCard(cardId, cardElement, deleteCardFromServerAction) {
  return deleteCardFromServerAction(cardId)
    .then(() => {
      cardElement.remove();
    });
}

export function likeCard(cardId, likeButton, likeCountElement, isLiked, changeLikeCardStatusAction) {
  return changeLikeCardStatusAction(cardId, isLiked)
    .then((updatedCardData) => {
      likeButton.classList.toggle("card__like-button_is-active");
      likeCountElement.textContent = updatedCardData.likes.length;
    });
}