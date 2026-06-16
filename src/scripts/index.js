import '../pages/index.css';
import { getUserInfo, getCardList, setUserInfo, setUserAvatar, addCard, changeLikeCardStatus, deleteCardFromServer } from "./components/api.js";
import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationSettings);

const cardsContainer = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow?.querySelector(".popup__form");

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoModalText = cardInfoModalWindow.querySelector(".popup__text");
const cardInfoModalUserList = cardInfoModalWindow.querySelector(".popup__list");

const infoDefinitionTemplate = document.getElementById("popup-info-definition-template");
const userPreviewTemplate = document.getElementById("popup-info-user-preview-template");

let currentUserId = null;
let cardToDeleteId = null;
let cardToDeleteElement = null;

function setButtonLoading(button, isLoading, defaultText, loadingText) {
  if (isLoading) {
    button.textContent = loadingText;
    button.disabled = true;
  } else {
    button.textContent = defaultText;
    button.disabled = false;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function createInfoItem(term, description) {
  const itemElement = infoDefinitionTemplate.content.cloneNode(true);
  itemElement.querySelector(".popup__info-term").textContent = term;
  itemElement.querySelector(".popup__info-description").textContent = description;
  return itemElement;
}

function createUserPreviewItem(userName) {
  const itemElement = userPreviewTemplate.content.cloneNode(true);
  const listItem = itemElement.querySelector(".popup__list-item");
  if (listItem) {
    listItem.textContent = userName;
  }
  return itemElement;
}

function handlePreviewPicture({ name, link }) {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
}

function openRemoveCardModal(cardId, cardElement) {
  cardToDeleteId = cardId;
  cardToDeleteElement = cardElement;
  clearValidation(removeCardForm, validationSettings);
  openModalWindow(removeCardModalWindow);
}

async function handleInfoClick(cardId) {
  try {
    const cards = await getCardList();
    const card = cards.find((c) => c._id === cardId);

    if (!card) return;

    cardInfoModalInfoList.innerHTML = "";
    cardInfoModalUserList.innerHTML = "";

    cardInfoModalInfoList.append(createInfoItem("Описание:", card.name));
    cardInfoModalInfoList.append(createInfoItem("Дата создания:", formatDate(card.createdAt)));
    cardInfoModalInfoList.append(createInfoItem("Владелец:", card.owner.name));
    cardInfoModalInfoList.append(createInfoItem("Количество лайков:", card.likes.length.toString()));

    cardInfoModalText.textContent = "Лайкнули:";

    if (card.likes && card.likes.length > 0) {
      card.likes.forEach((user) => {
        cardInfoModalUserList.append(createUserPreviewItem(user.name));
      });
    } else {
      cardInfoModalUserList.append(createUserPreviewItem("Нет лайков"));
    }

    openModalWindow(cardInfoModalWindow);
  } catch (err) {
  }
}

async function handleProfileFormSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.target.querySelector(".popup__button");
  const defaultText = submitButton.textContent;

  setButtonLoading(submitButton, true, defaultText, "Сохранение...");

  try {
    const userInformation = await setUserInfo({
      name: profileTitleInput.value,
      about: profileDescriptionInput.value,
    });
    profileTitle.textContent = userInformation.name;
    profileDescription.textContent = userInformation.about;
    closeModalWindow(profileFormModalWindow);
  } catch (err) {
  } finally {
    setButtonLoading(submitButton, false, defaultText, "Сохранение...");
  }
}

async function handleAvatarFormSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.target.querySelector(".popup__button");
  const defaultText = submitButton.textContent;

  setButtonLoading(submitButton, true, defaultText, "Сохранение...");

  try {
    const userInformation = await setUserAvatar(avatarInput.value);
    profileAvatar.style.backgroundImage = `url(${userInformation.avatar})`;
    closeModalWindow(avatarFormModalWindow);
    avatarForm.reset();
  } catch (err) {
  } finally {
    clearValidation(avatarForm, validationSettings);
    setButtonLoading(submitButton, false, defaultText, "Сохранение...");
  }
}

async function handleCardFormSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.target.querySelector(".popup__button");
  const defaultText = submitButton.textContent;

  setButtonLoading(submitButton, true, defaultText, "Создание...");

  try {
    const newCard = await addCard({
      name: cardNameInput.value,
      link: cardLinkInput.value,
    });
    cardsContainer.prepend(
      createCardElement(newCard, {
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: (cardId, likeButton, likeCountElement, isLiked) =>
          likeCard(cardId, likeButton, likeCountElement, isLiked, changeLikeCardStatus),
        onDeleteCard: (cardId, cardElement) => {
          openRemoveCardModal(cardId, cardElement);
        },
        onInfoClick: handleInfoClick,
        currentUserId,
      })
    );
    closeModalWindow(cardFormModalWindow);
    cardForm.reset();
  } catch (err) {

  } finally {
    clearValidation(cardForm, validationSettings);
    setButtonLoading(submitButton, false, defaultText, "Создание...");
  }
}

async function handleRemoveCardSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.target.querySelector(".popup__button");
  const defaultText = submitButton.textContent;

  setButtonLoading(submitButton, true, defaultText, "Удаление...");

  try {
    await deleteCard(cardToDeleteId, cardToDeleteElement, deleteCardFromServer);
    closeModalWindow(removeCardModalWindow);
    cardToDeleteId = null;
    cardToDeleteElement = null;
  } catch (err) {
  } finally {
    setButtonLoading(submitButton, false, defaultText, "Удаление...");
  }
}

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);

if (removeCardForm) {
  removeCardForm.addEventListener("submit", handleRemoveCardSubmit);
}

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((card) => {
      cardsContainer.append(
        createCardElement(card, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: (cardId, likeButton, likeCountElement, isLiked) =>
            likeCard(cardId, likeButton, likeCountElement, isLiked, changeLikeCardStatus),
          onDeleteCard: (cardId, cardElement) => {
            openRemoveCardModal(cardId, cardElement);
          },
          onInfoClick: handleInfoClick,
          currentUserId,
        })
      );
    });
  })
  .catch((err) => {
  });

const popupElements = document.querySelectorAll(".popup");
popupElements.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});