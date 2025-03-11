import { useMemo } from 'react';
import { IModalStyles, Modal, Stack, useTheme, Text, IconButton, Icon, Theme, mergeStyles, FontWeights } from '@fluentui/react';
import { COMPONENT_LOCALE_EN_US, ConferencePhoneInfo, MeetingConferencePhoneInfoModalStrings } from '@azure/communication-react';

export interface JoinByPhoneModalProps {
  conferencePhoneInfoList: ConferencePhoneInfo[];
  showModal?: boolean;
  onDismiss?: () => void;
}

export const JoinByPhoneModal = (props: JoinByPhoneModalProps): JSX.Element => {
  const { conferencePhoneInfoList, showModal, onDismiss } = props;

  const theme = useTheme();
  const strings = COMPONENT_LOCALE_EN_US.strings.meetingConferencePhoneInfo;

  const PhoneInfoModalStyle: Partial<IModalStyles> = useMemo(() => themedPhoneInfoModalStyle(theme), [theme]);

  return (
    <>
      <Modal
        titleAriaId={strings?.meetingConferencePhoneInfoModalTitle}
        isOpen={showModal}
        onDismiss={onDismiss}
        isBlocking={true}
        styles={PhoneInfoModalStyle}
      >
        <Stack horizontal horizontalAlign="space-between" verticalAlign="center" className={titleContainerClassName}>
          <Text role="heading" aria-level={2} className={titleClassName}>
            We could not detect a microphone. Join the call from your phone instead.
          </Text>
          <IconButton
            iconProps={{ iconName: 'Cancel' }}
            ariaLabel={strings?.meetingConferencePhoneInfoModalTitle}
            onClick={onDismiss}
            style={{ color: theme.palette.black }}
          />
        </Stack>
        {conferencePhoneInfoList.length === 0 && (
          <Stack horizontal>
            <Text className={stepTextStyle}>{strings?.meetingConferencePhoneInfoModalNoPhoneAvailable}</Text>
          </Stack>
        )}
        {conferencePhoneInfoList.length > 0 && (
          <Stack>
            <Stack horizontal horizontalAlign="space-between" className={phoneInfoInstructionLine}>
              <Stack.Item style={{ display: 'flex' }}>
                <Stack horizontal className={phoneInfoStep}>
                  <Stack className={infoConnectionLinkStyle(theme)}></Stack>
                  <Stack.Item className={phoneInfoIcon(theme)}>
                    <Stack verticalAlign="center" horizontalAlign="center">
                      <Icon iconName="JoinByPhoneDialStepIcon" className={phoneInfoIconStyle(theme)} />
                    </Stack>
                  </Stack.Item>
                  <Stack.Item>
                    <Text className={stepTextStyle}>{strings?.meetingConferencePhoneInfoModalDialIn}</Text>
                  </Stack.Item>
                </Stack>
              </Stack.Item>
              <Stack.Item className={phoneInfoStep}>
                {conferencePhoneInfoList.map((phoneNumber, index) => (
                  <Stack.Item key={index}>
                    <Text className={phoneInfoTextStyle}>
                      {_formatPhoneNumber(phoneNumber.phoneNumber, true)}{' '}
                      {phoneNumber.isTollFree
                        ? strings.meetingConferencePhoneInfoModalTollFree
                        : strings.meetingConferencePhoneInfoModalToll}
                    </Text>
                    <br />
                    <Text className={phoneInfoTextStyle}> {formatPhoneNumberInfo(phoneNumber, strings)}</Text>
                  </Stack.Item>
                ))}
              </Stack.Item>
            </Stack>
            <Stack
              horizontal
              horizontalAlign="space-between"
              verticalAlign="center"
              className={phoneInfoInstructionLine}
            >
              <Stack.Item style={{ display: 'flex' }}>
                <Stack horizontal>
                  <Stack className={infoConnectionLinkStyle(theme)}></Stack>
                  <Stack.Item className={phoneInfoIcon(theme)}>
                    <Stack verticalAlign="center" horizontalAlign="center">
                      <Icon iconName="JoinByPhoneConferenceIdIcon" className={phoneInfoIconStyle(theme)} />
                    </Stack>
                  </Stack.Item>
                  <Stack.Item>
                    <Text className={stepTextStyle}>{strings?.meetingConferencePhoneInfoModalMeetingId}</Text>
                  </Stack.Item>
                </Stack>
              </Stack.Item>
              <Text className={phoneInfoTextStyle}>{formatMeetingId(conferencePhoneInfoList[0]?.conferenceId)}</Text>
            </Stack>
            <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
              <Stack horizontal>
                <Stack.Item className={phoneInfoIcon(theme)} style={{ marginLeft: `${2/16}rem` }}>
                  <Icon iconName="JoinByPhoneWaitToBeAdmittedIcon" className={phoneInfoIconStyle(theme)} />
                </Stack.Item>
                <Stack.Item>
                  <Text className={stepTextStyle}>Wait to be admitted</Text>
                </Stack.Item>
              </Stack>
            </Stack>
          </Stack>
        )}
      </Modal>
    </>
  );
};

const formatPhoneNumberInfo = (
  phoneNumber: ConferencePhoneInfo,
  strings: MeetingConferencePhoneInfoModalStrings | undefined
): string => {
  const templateText =
    phoneNumber.country && phoneNumber.city ? strings?.meetingConferencePhoneInfoModalTollGeoData : '';
  return (
    templateText
      ?.replace('{country}', phoneNumber.country || '')
      .replace('{city}', phoneNumber.city || '')
      .trim() || ''
  );
};

const formatMeetingId = (meetingId?: string): string => {
  if (!meetingId) {
    return '';
  }
  if (meetingId?.length !== 9) {
    return meetingId;
  }

  return [meetingId.slice(0, 3), meetingId.slice(3, 6), meetingId.slice(6, 9)].join(' ') + '#';
};

const _formatPhoneNumber = (phoneNumber: string, enchant?: boolean): string => {
  // if input value is falsy eg if the user deletes the input, then just return
  if (!phoneNumber) {
    return phoneNumber;
  }

  // Only enchant North American phone numbers that begin with country code (1)
  if (enchant && phoneNumber[0] === '1' && phoneNumber.length === 11) {
    phoneNumber = `+${phoneNumber}`;
  }

  // if phone number starts with 1, format like 1 (xxx)xxx-xxxx.
  // if phone number starts with +, we format like +x (xxx)xxx-xxxx.
  // For now we are only supporting NA phone number formatting with country code +x
  // first we chop off the countrycode then we add it on when returning
  let countryCodeNA = '';
  if (phoneNumber[0] === '1') {
    countryCodeNA = '1 ';

    phoneNumber = phoneNumber.slice(1, phoneNumber.length);
  } else if (phoneNumber[0] === '+') {
    countryCodeNA = phoneNumber.slice(0, 2) + ' ';
    phoneNumber = phoneNumber.slice(2, phoneNumber.length);
  }

  // phoneNumberLength is used to know when to apply our formatting for the phone number
  const phoneNumberLength = phoneNumber.length;

  // we need to return the value with no formatting if its less then four digits
  // this is to avoid weird behavior that occurs if you  format the area code too early
  // if phoneNumberLength is greater than 10 we don't do any formatting

  if (phoneNumberLength < 4 || phoneNumberLength > 10) {
    // no formatting in this case, remove ' ' behind countrycode
    return countryCodeNA.replace(' ', '') + phoneNumber;
  }

  // if phoneNumberLength is greater than 4 and less the 7 we start to return
  // the formatted number
  if (phoneNumberLength < 7) {
    return `${countryCodeNA}(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }

  // finally, if the phoneNumberLength is greater then seven, we add the last
  // bit of formatting and return it.
  return `${countryCodeNA}(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(
    6,
    phoneNumber.length
  )}`;
};

const _pxToRem = (px: number): string => `${px / 16}rem`;
const themedPhoneInfoModalStyle = (theme: Theme): Partial<IModalStyles> => ({
  main: {
    borderRadius: theme.effects.roundedCorner6,
    padding: _pxToRem(24),
    width: _pxToRem(600),
    height: 'fit-content',
    overflow: 'hidden'
  },
  scrollableContent: {
    padding: 0,
    overflowY: 'hidden'
  }
});

const titleClassName = mergeStyles({
  fontWeight: 600,
  fontSize: _pxToRem(20),
  lineHeight: _pxToRem(28)
});

const titleContainerClassName = mergeStyles({
  paddingBottom: _pxToRem(30)
});

const stepTextStyle = mergeStyles({
  fontSize: _pxToRem(14),
  lineHeight: _pxToRem(40)
});

const phoneInfoTextStyle = mergeStyles({
  fontSize: _pxToRem(14),
  lineHeight: _pxToRem(40),
  fontWeight: FontWeights.semibold
});

const phoneInfoIcon = (theme: Theme): string => {
  return mergeStyles({
    background: `${theme.palette.themeLighter}`,
    height: _pxToRem(36),
    width: _pxToRem(36),
    marginRight: _pxToRem(12),
    borderRadius: _pxToRem(18)
  });
};

const phoneInfoInstructionLine = mergeStyles({
  marginBottom: _pxToRem(20)
});

const phoneInfoStep = mergeStyles({
  textAlign: 'right'
});

const phoneInfoIconStyle = (theme: Theme): string => {
  return mergeStyles({
    padding: _pxToRem(8),
    color: `${theme.palette.themePrimary}`,
    zIndex: 2
  });
};

const infoConnectionLinkStyle = (theme: Theme): string => {
  return mergeStyles({
    background: `${theme.palette.themeLighter}`,
    width: _pxToRem(2),
    position: 'relative',
    left: _pxToRem(19),
    top: _pxToRem(20),
    zIndex: 1
  });
};

