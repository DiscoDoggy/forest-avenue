import { useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet, TextInput } from "react-native";

interface AcceptRejectModalProps {
    isVisible: boolean;
    onClose: (tripName: string) => void;
    acceptButtonColor: string;
    rejectButtonColor: string;
    title: string;
    description: string;
}

export default function AcceptRejectModal({
    isVisible,
    onClose,
    acceptButtonColor,
    rejectButtonColor,
    title,
    description
}: AcceptRejectModalProps) {
    const [getNameInputText, setNameInputText] = useState('');

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={isVisible}
            onRequestClose={async () => {
                await onClose(getNameInputText);
            }}
        >
            <View style={modalStyles.centeredView}>
                <View style={modalStyles.modalStyle}>
                    <View>
                        <Text style={modalStyles.modalTitleText}>{title}</Text> 
                        <Text style={modalStyles.modalDescriptionText}>{description}</Text>
                    </View>

                    <TextInput 
                        onChangeText={setNameInputText}
                        value={getNameInputText}
                        placeholder="Enter Trip name"
                        style={modalStyles.modalTextInput}
                    />

                    <View style={modalStyles.modalButtonsContainer}>
                        <Pressable style={[
                            modalStyles.modalButton,
                            {
                                backgroundColor: rejectButtonColor
                            }
                            ]}
                            onPressOut={async () => {await onClose(getNameInputText)}}     
                        >
                            <Text style={{color:'#ff0000', fontWeight: 'bold'}}>No</Text>
                        </Pressable>

                        <Pressable style={[
                            modalStyles.modalButton,
                            {
                                backgroundColor: acceptButtonColor
                            }
                            ]}
                            onPressOut={async () => {await onClose('')}}
                            >
                            <Text style={{color: '#0084ff', fontWeight: 'bold'}}>Yes</Text>
                        </Pressable> 

                    </View>
                </View>
            </View>
        </Modal>
    )
}

const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    modalStyle: {
        backgroundColor: '#ffffff',
        // backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 16,
        borderRadius: 16,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.32,
        shadowRadius: 5.46,

        elevation: 9,
    },

    modalTitleText: {
        justifyContent:'center',
        fontSize: 16,
        fontWeight: 'bold'
    },

    modalDescriptionText: {
        justifyContent: 'center',
        fontSize: 14,
        color: '#949494'
    },

    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent:'space-between',
        marginTop: 8,
        marginBottom: 4
    },

    modalButton: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 16,
        borderColor: '#aaaaaa',
        borderWidth: 2,
        marginHorizontal: 8,
        borderRadius: 16,
    },
    modalTextInput: {
        borderWidth: 1,
        marginVertical: 12,
        borderRadius: 12
    }
})